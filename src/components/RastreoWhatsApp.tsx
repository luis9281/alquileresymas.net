"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Sends click_whatsapp for every wa.me link on the site (floating button,
 * footer, contact, about) without turning those server components into client
 * ones. The link's `data-ubicacion` names where it was; otherwise the page
 * path is used. Buttons that open WhatsApp with window.open (forms, floor
 * planner) send their own generate_lead.
 */
export default function RastreoWhatsApp() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const enlace = (e.target as Element | null)?.closest?.('a[href*="wa.me"]');
      if (!enlace) return;
      trackEvent("click_whatsapp", {
        ubicacion: (enlace as HTMLElement).dataset.ubicacion ?? window.location.pathname,
      });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
