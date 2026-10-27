import { NextResponse } from "next/server";
import type { QuoteItem } from "@/lib/types";
import { registrarSolicitud } from "@/lib/solicitudes-log";
import { captchaValido, CorreoNoConfigurado, EMAIL_VALIDO, enviarAGerencia, ipDe } from "@/lib/correo";

type QuoteRequestBody = {
  nombre?: string;
  email?: string;
  telefono?: string;
  fechaEvento?: string;
  lugar?: string;
  mensaje?: string;
  items?: QuoteItem[];
  /** Honeypot field: real visitors never fill this. */
  website?: string;
  /** Token del captcha Cloudflare Turnstile. */
  captchaToken?: string;
};

export async function POST(request: Request) {
  let body: QuoteRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
  }

  if (body.website) {
    // Honeypot tripped: silently pretend success so bots don't learn anything.
    return NextResponse.json({ ok: true });
  }

  if (!(await captchaValido(body.captchaToken ?? "", ipDe(request)))) {
    return NextResponse.json({ error: "Confirma que no eres un robot e intenta de nuevo." }, { status: 400 });
  }

  const nombre = (body.nombre ?? "").trim();
  const email = (body.email ?? "").trim();

  if (!nombre || !EMAIL_VALIDO.test(email)) {
    return NextResponse.json({ error: "Revisa tu nombre y correo electronico." }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const listaTexto = items.length
    ? items.map((i) => `- ${i.title} x${i.qty}`).join("\n")
    : "(sin productos seleccionados)";

  const asunto = `[Cotizacion] Nueva solicitud de ${nombre}`;
  const cuerpo = `Nueva solicitud de cotizacion desde alquileresymas.net

Nombre: ${nombre}
Email: ${email}
Telefono: ${body.telefono ?? ""}
Fecha del evento: ${body.fechaEvento ?? ""}
Lugar: ${body.lugar ?? ""}

Productos solicitados:
${listaTexto}

Mensaje:
${body.mensaje ?? ""}
`;

  try {
    await enviarAGerencia({ asunto, texto: cuerpo, replyTo: email });

    // The email already went out, so a failed log entry shouldn't fail the request.
    await registrarSolicitud({
      nombre,
      email,
      telefono: body.telefono ?? "",
      fechaEvento: body.fechaEvento ?? "",
      lugar: body.lugar ?? "",
      items,
    }).catch((error) => console.error("Error registrando la solicitud en el log:", error));

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof CorreoNoConfigurado) {
      console.error(error.message);
      return NextResponse.json(
        { error: "El envio de correo no esta configurado todavia. Intenta por WhatsApp mientras tanto." },
        { status: 503 }
      );
    }
    console.error("Error enviando correo de cotizacion:", error);
    return NextResponse.json({ error: "No se pudo enviar la solicitud. Intenta de nuevo." }, { status: 500 });
  }
}
