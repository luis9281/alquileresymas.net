"use client";

import { useEffect } from "react";

/** Counts one view of this product per browser session (feeds "Lo más visto" on the home page). */
export default function RegistrarVista({ productoId }: { productoId: string }) {
  useEffect(() => {
    const marca = `vista:${productoId}`;
    try {
      if (sessionStorage.getItem(marca)) return;
      sessionStorage.setItem(marca, "1");
    } catch {
      // Private mode / blocked storage: still count, at worst once per page load.
    }
    const cuerpo = new Blob([JSON.stringify({ id: productoId })], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/vistas", cuerpo)) {
      fetch("/api/vistas", { method: "POST", body: cuerpo, keepalive: true }).catch(() => {});
    }
  }, [productoId]);

  return null;
}
