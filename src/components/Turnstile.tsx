"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import Script from "next/script";

type TurnstileApi = {
  render: (el: HTMLElement, opts: { sitekey: string; language?: string }) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

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

  function renderWidget() {
    if (!window.turnstile || !containerRef.current || widgetId.current) return;
    widgetId.current = window.turnstile.render(containerRef.current, { sitekey: siteKey, language: "es" });
  }

  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderWidget}
      />
      <div ref={containerRef} />
    </>
  );
});

export default Turnstile;
