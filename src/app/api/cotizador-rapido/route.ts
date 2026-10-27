import { NextResponse } from "next/server";
import { getProductos } from "@/lib/sanity/queries";
import { precioDeVariante } from "@/lib/precio";
import { tituloListado } from "@/lib/producto";
import { registrarSolicitud } from "@/lib/solicitudes-log";
import { captchaValido, CorreoNoConfigurado, EMAIL_VALIDO, enviarAGerencia, ipDe } from "@/lib/correo";
import { anotarEnTxt } from "@/lib/cotizador-log";
import { textoCotizacion, ZONAS_TRANSPORTE, type CotizacionRapida, type LineaCotizacion } from "@/lib/cotizador";

type Body = Partial<Omit<CotizacionRapida, "lineas">> & {
  lineas?: { id?: string; qty?: number }[];
  /** Honeypot field: real visitors never fill this. */
  website?: string;
  captchaToken?: string;
  /** "whatsapp": the visitor sent it by WhatsApp from their phone; we only log it. */
  canal?: "correo" | "whatsapp";
};

const texto = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
  }

  if (body.website) return NextResponse.json({ ok: true });

  const porWhatsApp = body.canal === "whatsapp";
  // The WhatsApp button only logs (nothing is emailed), so it doesn't spend a captcha token.
  if (!porWhatsApp && !(await captchaValido(body.captchaToken ?? "", ipDe(request)))) {
    return NextResponse.json({ error: "Confirma que no eres un robot e intenta de nuevo." }, { status: 400 });
  }

  const empresa = texto(body.empresa, 120);
  const email = texto(body.email, 200);
  const whatsapp = texto(body.whatsapp, 40);
  if (!empresa || !EMAIL_VALIDO.test(email) || whatsapp.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ error: "Revisa el nombre de la empresa, el correo y el WhatsApp." }, { status: 400 });
  }

  // Prices come from the catalog, never from the browser.
  const productos = await getProductos();
  const lineas: LineaCotizacion[] = (Array.isArray(body.lineas) ? body.lineas : []).slice(0, 100).flatMap((l) => {
    const [productoId, idx] = String(l.id ?? "").split("::");
    const producto = productos.find((p) => p._id === productoId);
    const varianteIdx = Number(idx);
    const qty = Math.min(10000, Math.max(1, Math.floor(Number(l.qty)) || 1));
    if (!producto || !producto.variantes[varianteIdx]) return [];
    return [{ id: String(l.id), titulo: tituloListado({ producto, varianteIdx }), qty, precio: precioDeVariante(producto, varianteIdx) }];
  });
  if (!lineas.length) {
    return NextResponse.json({ error: "Agrega al menos un producto a la cotizacion." }, { status: 400 });
  }

  const cotizacion: CotizacionRapida = {
    empresa,
    email,
    whatsapp,
    direccion: texto(body.direccion, 300),
    mapsUrl: /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)/.test(texto(body.mapsUrl))
      ? texto(body.mapsUrl)
      : "",
    desde: texto(body.desde, 10),
    hasta: texto(body.hasta, 10),
    observaciones: texto(body.observaciones, 2000),
    zonaId: ZONAS_TRANSPORTE.some((z) => z.id === body.zonaId) ? String(body.zonaId) : "",
    lineas,
  };

  const detalle = `Enviada por: ${porWhatsApp ? "WhatsApp" : "correo"}\n\n${textoCotizacion(cotizacion)}`;

  // Logged before emailing, so a request still shows up if SMTP fails.
  await anotarEnTxt(detalle).catch((error) => console.error("Error anotando la cotizacion en el txt:", error));
  await registrarSolicitud({
    nombre: empresa,
    email,
    telefono: whatsapp,
    fechaEvento: [cotizacion.desde, cotizacion.hasta].filter(Boolean).join(" al "),
    lugar: cotizacion.direccion,
    items: lineas.map((l) => ({ id: l.id, title: l.titulo, url: "", qty: l.qty })),
    origen: "cotizador-rapido",
    detalle,
  }).catch((error) => console.error("Error registrando la solicitud en el log:", error));

  if (porWhatsApp) return NextResponse.json({ ok: true });

  try {
    await enviarAGerencia({
      asunto: `[Cotizador rapido] ${empresa}`,
      texto: `Cotizacion armada en alquileresymas.net/cotizador-rapido\n\n${textoCotizacion(cotizacion)}`,
      replyTo: email,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof CorreoNoConfigurado) {
      console.error(error.message);
      return NextResponse.json(
        { error: "El envio de correo no esta configurado todavia. Intenta por WhatsApp mientras tanto." },
        { status: 503 }
      );
    }
    console.error("Error enviando el cotizador rapido:", error);
    return NextResponse.json({ error: "No se pudo enviar la cotizacion. Intenta de nuevo." }, { status: 500 });
  }
}
