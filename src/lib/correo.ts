import nodemailer from "nodemailer";
import { asignarVendedor, devolverAsignacion, resumenConteos, type Asignacion } from "./reparto";
import { avisarPorWhatsApp } from "./aviso-whatsapp";

/** Debe coincidir con la action del widget (components/Turnstile.tsx). */
const TURNSTILE_ACTION = "cotizacion";

// Dominios desde donde se acepta el captcha. localhost solo cuenta en desarrollo.
const HOSTNAMES_PERMITIDOS = [
  "alquileresymas.net",
  "www.alquileresymas.net",
  ...(process.env.NODE_ENV === "development" ? ["localhost", "127.0.0.1"] : []),
];

type SiteverifyResult = { success?: boolean; action?: string; hostname?: string };

/** IP del visitante detrás de Cloudflare / Vercel. */
export function ipDe(request: Request): string | null {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null;
}

/** Valida el token de Turnstile con Cloudflare. Sin TURNSTILE_SECRET_KEY no se exige captcha. */
export async function captchaValido(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token || token.length > 2048) return false;

  const datos = new URLSearchParams({ secret, response: token });
  if (ip) datos.set("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: datos,
    });
    if (!res.ok) return false;
    const resultado = (await res.json()) as SiteverifyResult;
    return (
      resultado.success === true &&
      resultado.action === TURNSTILE_ACTION &&
      !!resultado.hostname &&
      HOSTNAMES_PERMITIDOS.includes(resultado.hostname)
    );
  } catch (error) {
    console.error("Error validando el captcha:", error);
    return false;
  }
}

export const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class CorreoNoConfigurado extends Error {}

/** Envía un correo a QUOTE_TO_EMAIL (gerencia) y, si se indica, también a `vendedor`.
 * Lanza CorreoNoConfigurado si faltan las variables SMTP_*. */
export async function enviarAGerencia(opts: { asunto: string; texto: string; html?: string; replyTo: string; vendedor?: string }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, QUOTE_TO_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !QUOTE_TO_EMAIL) {
    throw new CorreoNoConfigurado("Faltan variables de entorno SMTP_* / QUOTE_TO_EMAIL.");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"Alquileres Eventos & Más" <${SMTP_USER}>`,
    to: [opts.vendedor, QUOTE_TO_EMAIL].filter((e): e is string => Boolean(e)),
    replyTo: opts.replyTo,
    subject: opts.asunto,
    text: opts.texto,
    html: opts.html,
  });
}

/**
 * Envía una solicitud de cotización repartida: siempre a gerencia (QUOTE_TO_EMAIL) y a la persona
 * de ventas con menos solicitudes (src/lib/reparto.ts). Si el correo falla, se le devuelve el conteo.
 * Al salir bien avisa por WhatsApp a quién se asignó. Devuelve el correo de ventas asignado.
 */
export async function enviarSolicitudRepartida(opts: {
  asunto: string;
  texto: string;
  replyTo: string;
  /** Para el aviso de WhatsApp. */
  origen: string;
  cliente: string;
  telefono: string;
  asignacion?: Asignacion;
}): Promise<string> {
  const asignacion = opts.asignacion ?? (await asignarVendedor());
  const nombreCorto = asignacion.email.split("@")[0];

  try {
    await enviarAGerencia({
      asunto: `${opts.asunto} -> ${nombreCorto}`,
      texto: `Asignada a: ${asignacion.email}\nReparto acumulado: ${resumenConteos(asignacion)}\n\n${opts.texto}`,
      replyTo: opts.replyTo,
      vendedor: asignacion.email,
    });
  } catch (error) {
    await devolverAsignacion(asignacion.email);
    throw error;
  }

  await avisarPorWhatsApp(
    [
      `Nueva solicitud de cotizacion (${opts.origen})`,
      `Cliente: ${opts.cliente}`,
      opts.telefono && `Tel: ${opts.telefono}`,
      `Correo del cliente: ${opts.replyTo}`,
      `Asignada a: ${asignacion.email}`,
      `Reparto: ${resumenConteos(asignacion)}`,
    ]
      .filter(Boolean)
      .join("\n")
  ).catch((error) => console.error("Error enviando el aviso por WhatsApp:", error));

  return asignacion.email;
}
