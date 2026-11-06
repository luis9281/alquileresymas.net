/**
 * WhatsApp notice to the office every time a quote request comes in, saying who it was assigned to.
 * Sent through CallMeBot (free): the receiving phone must first message the bot once to get its
 * apikey; see .env.local.example. Without CALLMEBOT_APIKEY it does nothing.
 */

const TELEFONO_POR_DEFECTO = "50766728087";

export async function avisarPorWhatsApp(texto: string): Promise<void> {
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!apikey) return;
  const telefono = (process.env.WHATSAPP_AVISO_TELEFONO || TELEFONO_POR_DEFECTO).replace(/\D/g, "");

  const url = `https://api.callmebot.com/whatsapp.php?${new URLSearchParams({ phone: telefono, text: texto.slice(0, 1500), apikey })}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`CallMeBot respondio ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
