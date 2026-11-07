"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Script from "next/script";

type TurnstileApi = {
  render: (el: HTMLElement, opts: { sitekey: string; action?: string; language?: string }) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** Debe coincidir con lo que valida /api/cotizacion. */
export const TURNSTILE_ACTION = "cotizacion";

export type TurnstileHandle = { reset: () => void };

/**
 * Captcha de Cloudflare Turnstile. Inserta dentro del <form> un input oculto
 * "cf-turnstile-response" con el token que luego valida /api/cotizacion.
 * Se renderiza de forma explicita para que funcione tambien al navegar entre
 * paginas sin recargar (el script ya cargado no vuelve a disparar onLoad).
 */
const Turnstile = forwardRef<TurnstileHandle, { siteKey: string }>(function Turnstile({ siteKey }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // The Cloudflare script weighs ~1.9 MB: load it only once the visitor starts
  // the form (first focus or tap inside it) or scrolls near the widget.
  const [cargar, setCargar] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || cargar) return;
    const activar = () => setCargar(true);
    const form = el.closest("form");
    form?.addEventListener("focusin", activar, { once: true });
    form?.addEventListener("pointerdown", activar, { once: true });
    const observer = new IntersectionObserver((entradas) => entradas.some((e) => e.isIntersecting) && activar(), {
      rootMargin: "300px",
    });
    observer.observe(el);
    return () => {
      form?.removeEventListener("focusin", activar);
      form?.removeEventListener("pointerdown", activar);
      observer.disconnect();
    };
  }, [cargar]);

  function renderWidget() {
    if (!window.turnstile || !containerRef.current || widgetId.current) return;
    widgetId.current = window.turnstile.render(containerRef.current, { sitekey: siteKey, action: TURNSTILE_ACTION, language: "es" });
  }

  useEffect(() => {
    if (!cargar) return;
    renderWidget();
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, cargar]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  return (
    <>
      {cargar && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={renderWidget}
        />
      )}
      {/* Reserves the widget's 65px so the buttons below don't jump when it appears. */}
      <div ref={containerRef} className="min-h-[65px]" />
    </>
  );
});

export default Turnstile;
