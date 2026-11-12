"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Guided tour of the quick quote: darkens the page, lights up one field at a
 * time (elements marked with data-tour="…" in CotizadorRapido) and shows a
 * tooltip with what to do there. Starts by itself on the first visit; the
 * "Ver cómo cotizar" button replays it. Steps whose field isn't on screen
 * (e.g. the send buttons before adding products) are skipped.
 */

const PASOS = [
  { id: "cliente", titulo: "Tus datos", texto: "Escribe tu nombre o empresa, correo y WhatsApp. Ahí te enviamos la confirmación." },
  { id: "fecha", titulo: "Fecha del evento", texto: "Elige desde y hasta qué día necesitas los artículos." },
  { id: "direccion", titulo: "¿Dónde es el evento?", texto: "Escribe la dirección. Si quieres, pega abajo el enlace de Google Maps." },
  { id: "transporte", titulo: "Transporte", texto: "Elige si te lo llevamos (según tu zona) o si lo retiras en el local sin costo." },
  { id: "productos", titulo: "Añade productos", texto: "Busca aquí (ej. silla tiffany, mantel, copa) y toca cada producto. Luego ajusta las cantidades en la lista." },
  { id: "enviar", titulo: "Envía tu cotización", texto: "Mándala por WhatsApp o por correo. Te confirmamos disponibilidad y el precio final." },
];

const CLAVE = "tour-cotizador-visto";
const MARGEN = 8; // light around the field
const ANCHO_GLOBO = 320;

type Caja = { top: number; left: number; width: number; height: number };

function buscar(id: string) {
  return document.querySelector<HTMLElement>(`[data-tour="${id}"]`);
}

export default function TourCotizador() {
  const [paso, setPaso] = useState<number | null>(null);
  const [caja, setCaja] = useState<Caja | null>(null);
  const globo = useRef<HTMLDivElement>(null);
  const [altoGlobo, setAltoGlobo] = useState(170);

  const pasos = PASOS.filter((p) => paso === null || buscar(p.id));
  const actual = paso === null ? null : pasos[paso];

  const cerrar = useCallback(() => {
    setPaso(null);
    try {
      localStorage.setItem(CLAVE, "1");
    } catch {}
  }, []);

  // First visit: start by itself once the page has settled.
  useEffect(() => {
    let visto = false;
    try {
      visto = localStorage.getItem(CLAVE) === "1";
    } catch {}
    if (visto) return;
    const t = window.setTimeout(() => setPaso(0), 1200);
    return () => window.clearTimeout(t);
  }, []);

  // Bring the field into view, then follow it while scrolling/resizing.
  useEffect(() => {
    if (!actual) return;
    const el = buscar(actual.id);
    if (!el) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reducido ? "auto" : "smooth" });

    let frame = 0;
    const medir = () => {
      const r = el.getBoundingClientRect();
      setCaja((c) =>
        c && c.top === r.top && c.left === r.left && c.width === r.width && c.height === r.height
          ? c
          : { top: r.top, left: r.left, width: r.width, height: r.height },
      );
      frame = requestAnimationFrame(medir);
    };
    medir();
    return () => cancelAnimationFrame(frame);
  }, [actual]);

  useLayoutEffect(() => {
    if (globo.current) setAltoGlobo(globo.current.offsetHeight);
  }, [actual, caja?.width]);

  useEffect(() => {
    if (paso === null) return;
    const teclas = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowRight") setPaso((p) => (p !== null && p < pasos.length - 1 ? p + 1 : p));
      if (e.key === "ArrowLeft") setPaso((p) => (p ? p - 1 : p));
    };
    document.addEventListener("keydown", teclas);
    return () => document.removeEventListener("keydown", teclas);
  }, [paso, pasos.length, cerrar]);

  const ultimo = paso !== null && paso === pasos.length - 1;

  // Tooltip below the field if it fits, else above, else pinned to the bottom.
  let estiloGlobo: React.CSSProperties = {};
  if (caja) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ancho = Math.min(ANCHO_GLOBO, vw - 32);
    const left = Math.min(Math.max(16, caja.left), vw - ancho - 16);
    const abajo = caja.top + caja.height + MARGEN + 12;
    const arriba = caja.top - MARGEN - 12 - altoGlobo;
    const top = abajo + altoGlobo <= vh - 16 ? abajo : arriba >= 16 ? arriba : vh - altoGlobo - 16;
    estiloGlobo = { top, left, width: ancho };
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setPaso(0)}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-teal-dark shadow-sm transition-colors hover:border-teal"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime text-ink" aria-hidden>
          ?
        </span>
        Ver cómo cotizar
      </button>

      {actual && caja && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="tour-titulo">
          {/* Click on the dark area closes the tour. */}
          <div className="absolute inset-0" onClick={cerrar} />
          {/* The light: a hole cut by a huge shadow around the field. */}
          <div
            className="pointer-events-none absolute rounded-xl ring-2 ring-lime transition-all duration-300 ease-out"
            style={{
              top: caja.top - MARGEN,
              left: caja.left - MARGEN,
              width: caja.width + MARGEN * 2,
              height: caja.height + MARGEN * 2,
              boxShadow: "0 0 0 9999px rgba(12, 28, 34, 0.7)",
            }}
          />

          <div
            ref={globo}
            className="absolute rounded-xl bg-white p-4 text-ink shadow-2xl transition-[top,left] duration-300 ease-out"
            style={estiloGlobo}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-teal">
              Paso {paso! + 1} de {pasos.length}
            </p>
            <h2 id="tour-titulo" className="mt-1 font-sans text-base font-semibold text-ink">
              {actual.titulo}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{actual.texto}</p>

            <div className="mt-4 flex items-center gap-2">
              <button type="button" onClick={cerrar} className="mr-auto text-sm text-muted underline hover:text-ink">
                Saltar
              </button>
              {paso! > 0 && (
                <button
                  type="button"
                  onClick={() => setPaso(paso! - 1)}
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink hover:border-teal"
                >
                  Atrás
                </button>
              )}
              <button
                type="button"
                autoFocus
                onClick={() => (ultimo ? cerrar() : setPaso(paso! + 1))}
                className="rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink hover:bg-lime-dark"
              >
                {ultimo ? "¡Listo!" : "Siguiente →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
