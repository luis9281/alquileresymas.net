import { NextResponse } from "next/server";
import { ID_PRODUCTO_VALIDO, registrarVista } from "@/lib/vistas";

// Search engines and link previews also open product pages; they aren't customers.
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse/i;

/** Called by <RegistrarVista> (navigator.sendBeacon) once per product per browser session. */
export async function POST(request: Request) {
  if (BOT.test(request.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });

  let id: unknown;
  try {
    ({ id } = await request.json());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (typeof id !== "string" || !ID_PRODUCTO_VALIDO.test(id)) return new NextResponse(null, { status: 400 });

  try {
    await registrarVista(id);
  } catch (error) {
    // A lost view isn't worth an error page; just log it.
    console.error("Error registrando vista:", error);
  }
  return new NextResponse(null, { status: 204 });
}
