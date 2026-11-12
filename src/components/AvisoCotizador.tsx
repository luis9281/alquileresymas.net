"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { trackEvent } from "@/lib/analytics";

/**
 * Invitation to the quick quote: a sticky bar on regular pages and a pop-up
 * on blog posts (readers there are further from buying and the bar gets lost
 * under the article). It appears after 35 s on the site, or earlier when the
 * mouse leaves through the top of the window (desktop only). Shown at most
 * once every 7 days per visitor; closing it counts as seen.
 *
 * `?aviso=ya` in the URL shows it right away and ignores the 7 days (testing).
 */

const RETRASO_MS = 35_000;
const DIAS_ENTRE_AVISOS = 7;
const CLAVE = "aviso-cotizador-visto";
const DESTINO = "/cotizador-rapido";

// The quote pages already are the destination; /gracias comes right after
// quoting; the studio and floor planner are work tools.
const RUTAS_SIN_AVISO = ["/cotizador-rapido", "/cotizacion", "/gracias", "/studio", "/planos-del-salon"];

type Formato = "barra" | "popup";

function rutaSinAviso(ruta: string) {
  return RUTAS_SIN_AVISO.some((r) => ruta === r || ruta.startsWith(`${r}/`));
}

function vistoHacepoco() {
  try {
    const visto = Number(localStorage.getItem(CLAVE));
    return visto > 0 && Date.now() - visto < DIAS_ENTRE_AVISOS * 86_400_000;
  } catch {
    return false;
  }
}

function marcarVisto() {
  try {
    localStorage.setItem(CLAVE, String(Date.now()));
  } catch {
    // Without storage it may show again next visit; nothing breaks.
  }
}

export default function AvisoCotizador() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState<Formato | null>(null);
  const inicio = useRef(0);
  const yaSalio = useRef(false);

  const formato: Formato = ruta.startsWith("/blog/") ? "popup" : "barra";

  useEffect(() => {
    if (!inicio.current) inicio.current = Date.now();
    if (yaSalio.current || rutaSinAviso(ruta)) return;

    const forzado = new URLSearchParams(window.location.search).get("aviso") === "ya";
    if (!forzado && vistoHacepoco()) return;

    const mostrar = () => {
      if (yaSalio.current) return;
      yaSalio.current = true;
      if (!forzado) marcarVisto();
      setAbierto(formato);
      trackEvent("aviso_cotizador", { accion: "mostrado", formato, ruta });
    };

    if (forzado) {
      const t = window.setTimeout(mostrar, 600);
      return () => window.clearTimeout(t);
    }

    // The 35 s count from arrival on the site, not from each page change.
    const restante = Math.max(0, RETRASO_MS - (Date.now() - inicio.current));
    const t = window.setTimeout(mostrar, restante);

    // Exit intent: the pointer leaves through the top edge (towards tabs/close).
    const conMouse = window.matchMedia("(pointer: fine)").matches;
    const alSalir = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0) mostrar();
    };
    if (conMouse) document.documentElement.addEventListener("mouseleave", alSalir);

    return () => {
      window.clearTimeout(t);
      document.documentElement.removeEventListener("mouseleave", alSalir);
    };
  }, [ruta, formato]);

  function cerrar() {
    if (abierto) trackEvent("aviso_cotizador", { accion: "cerrado", formato: abierto, ruta });
    setAbierto(null);
  }

  function alClic() {
    if (abierto) trackEvent("aviso_cotizador", { accion: "clic", formato: abierto, ruta });
    setAbierto(null);
  }

  // On an excluded page (e.g. the quote itself) it is not drawn.
  const visible = rutaSinAviso(ruta) ? null : abierto;

  return (
    <AnimatePresence>
      {visible === "barra" && <Barra key="barra" onCerrar={cerrar} onClic={alClic} />}
      {visible === "popup" && <Popup key="popup" onCerrar={cerrar} onClic={alClic} />}
    </AnimatePresence>
  );
}

type Acciones = { onCerrar: () => void; onClic: () => void };

function IconoLista() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function BotonCerrar({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Cerrar"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl leading-none transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-lime ${className}`}
    >
      ×
    </button>
  );
}

function Barra({ onCerrar, onClic }: Acciones) {
  return (
    <motion.div
      role="region"
      aria-label="Ayuda para cotizar"
      initial={{ y: "150%" }}
      animate={{ y: 0 }}
      exit={{ y: "150%" }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      // Right edge leaves room for the floating WhatsApp button (h-14 at right-4 / md:right-6).
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-[5.5rem] z-40 md:bottom-6 md:left-6 md:right-28 lg:left-1/2 lg:right-auto lg:w-[min(52rem,calc(100%-15rem))] lg:-translate-x-1/2"
    >
      <div className="flex items-center gap-3 rounded-2xl bg-ink py-2.5 pl-3 pr-2 text-white shadow-[0_14px_34px_-10px_rgba(0,0,0,.45)] sm:gap-4 sm:pl-4">
        <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime text-ink sm:flex">
          <IconoLista />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <b className="block font-display text-[0.95rem] font-semibold sm:text-lg">¿Estás armando un evento?</b>
          <small className="hidden text-sm text-[#b9cbd0] sm:block">Te ayudamos a cotizar en 5 minutos, sin compromiso.</small>
          <small className="text-xs text-[#b9cbd0] sm:hidden">Cotiza en 5 minutos.</small>
        </span>
        <Link
          href={DESTINO}
          onClick={onClic}
          className="shrink-0 whitespace-nowrap rounded-full bg-lime px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-lime-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-lime sm:px-5 sm:text-base"
        >
          Cotizar<span className="hidden sm:inline"> ahora</span> →
        </Link>
        <BotonCerrar onClick={onCerrar} className="text-[#b9cbd0] hover:text-white" />
      </div>
    </motion.div>
  );
}

function Popup({ onCerrar, onClic }: Acciones) {
  const boton = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    boton.current?.focus({ preventScroll: true });
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [onCerrar]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(15,32,38,.55)] p-4"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="aviso-cotizador-titulo"
        initial={{ y: 16, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 16, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative w-full max-w-[26rem] overflow-hidden rounded-2xl bg-cream shadow-2xl"
      >
        <div className="bg-teal-dark px-6 pb-5 pt-6 text-white">
          <span className="mb-2.5 inline-block rounded-full bg-lime px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink">
            Cotizador rápido
          </span>
          <h2 id="aviso-cotizador-titulo" className="text-balance pr-6 font-display text-2xl leading-tight text-white">
            ¿Estás armando un evento? Te ayudamos a cotizar en 5 minutos
          </h2>
        </div>
        <div className="grid gap-4 px-6 pb-6 pt-5">
          <ul className="grid gap-2 text-[0.95rem] text-ink">
            {["Eliges lo que necesitas del catálogo", "Ves el total al instante", "Te confirmamos disponibilidad por WhatsApp"].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime" aria-hidden>
                  <svg viewBox="0 0 16 16" width="12" height="12">
                    <path d="M4 8.5l2.5 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
          <Link
            ref={boton}
            href={DESTINO}
            onClick={onClic}
            className="rounded-full bg-lime px-5 py-3 text-center font-semibold text-ink transition-colors hover:bg-lime-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            Empezar mi cotización →
          </Link>
          <button type="button" onClick={onCerrar} className="justify-self-center text-sm text-muted underline hover:text-ink">
            Ahora no, sigo leyendo
          </button>
        </div>
        <BotonCerrar onClick={onCerrar} className="absolute right-2.5 top-2.5 text-white/70 hover:text-white" />
      </motion.div>
    </motion.div>
  );
}
