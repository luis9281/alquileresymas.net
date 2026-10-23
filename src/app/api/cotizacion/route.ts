import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type { QuoteItem } from "@/lib/types";

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

/** Valida el token de Turnstile con Cloudflare. Sin TURNSTILE_SECRET_KEY no se exige captcha. */
async function captchaValido(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const datos = new URLSearchParams({ secret, response: token });
  if (ip) datos.set("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: datos,
    });
    const resultado = (await res.json()) as { success?: boolean };
    return resultado.success === true;
  } catch (error) {
    console.error("Error validando el captcha:", error);
    return false;
  }
}

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

  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null;
  if (!(await captchaValido(body.captchaToken ?? "", ip))) {
    return NextResponse.json({ error: "Confirma que no eres un robot e intenta de nuevo." }, { status: 400 });
  }

  const nombre = (body.nombre ?? "").trim();
  const email = (body.email ?? "").trim();

  if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, QUOTE_TO_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !QUOTE_TO_EMAIL) {
    console.error("Faltan variables de entorno SMTP_* / QUOTE_TO_EMAIL para enviar la cotizacion.");
    return NextResponse.json(
      { error: "El envio de correo no esta configurado todavia. Intenta por WhatsApp mientras tanto." },
      { status: 503 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Alquileres Eventos & Más" <${SMTP_USER}>`,
      to: QUOTE_TO_EMAIL,
      replyTo: email,
      subject: asunto,
      text: cuerpo,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error enviando correo de cotizacion:", error);
    return NextResponse.json({ error: "No se pudo enviar la solicitud. Intenta de nuevo." }, { status: 500 });
  }
}
