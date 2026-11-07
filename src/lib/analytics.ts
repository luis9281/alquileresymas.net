/**
 * GA4 conversion events.
 *
 * Events go through the gtag command queue (dataLayer), so they are kept even
 * when gtag.js hasn't loaded yet (GoogleAnalytics.tsx loads it with
 * lazyOnload) and are sent as soon as it does. Without GA configured
 * (local/preview) the queue is simply never read.
 *
 * Names in use:
 * - generate_lead   quote sent (already marked as a key event in GA4).
 *                   `method` says which form and channel.
 * - add_to_quote    product added to the quote cart.
 * - click_whatsapp  click on any wa.me link (RastreoWhatsApp.tsx).
 */

type Params = Record<string, string | number | boolean | undefined>;

type VentanaConGtag = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

export function trackEvent(nombre: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  const w = window as VentanaConGtag;
  if (typeof w.gtag === "function") {
    w.gtag("event", nombre, params);
    return;
  }
  const dataLayer = (w.dataLayer = w.dataLayer || []);
  // gtag.js only reads `arguments` objects from the queue, not plain arrays.
  function gtag(..._args: unknown[]) {
    dataLayer.push(arguments);
  }
  gtag("event", nombre, params);
}

/** method values for generate_lead: one per form and channel. */
export type MetodoLead =
  | "cotizacion_correo"
  | "cotizacion_whatsapp"
  | "cotizador_rapido_correo"
  | "cotizador_rapido_whatsapp"
  | "planos_whatsapp";

export function trackLead(metodo: MetodoLead, extra: Params = {}) {
  trackEvent("generate_lead", { method: metodo, ...extra });
}
