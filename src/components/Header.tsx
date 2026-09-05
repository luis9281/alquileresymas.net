"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuote } from "./QuoteContext";

const SERVICIOS_LINKS = [
  { href: "/planos-del-salon", label: "Planos del Salón" },
  { href: "/diseno-de-eventos", label: "Diseño de Eventos" },
  { href: "/catalogo", label: "Catálogo de Productos" },
];

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { label: "Servicios", children: SERVICIOS_LINKS },
  { href: "/blog", label: "Blog" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [serviciosOpen, setServiciosOpen] = useState(false);
  const [mobileServiciosOpen, setMobileServiciosOpen] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { totalCount } = useQuote();

  const openServicios = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setServiciosOpen(true);
  };
  const scheduleCloseServicios = () => {
    closeTimeout.current = setTimeout(() => setServiciosOpen(false), 150);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1350px] items-center justify-between gap-6 px-6 py-3">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="Alquileres Eventos & Más" width={274} height={60} className="h-12 w-auto" priority />
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-7">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <li
                  key={link.label}
                  className="relative"
                  onMouseEnter={openServicios}
                  onMouseLeave={scheduleCloseServicios}
                >
                  <button
                    type="button"
                    aria-expanded={serviciosOpen}
                    onClick={() => setServiciosOpen((v) => !v)}
                    className="flex items-center gap-1 font-medium text-ink hover:text-teal"
                  >
                    {link.label}
                    <svg
                      className={`h-3.5 w-3.5 transition-transform ${serviciosOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {serviciosOpen && (
                      <motion.ul
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 min-w-[220px] rounded-xl border border-border bg-cream py-2 shadow-lg"
                      >
                        {link.children.map((sub) => (
                          <li key={sub.href}>
                            <Link
                              href={sub.href}
                              className="block px-4 py-2 text-sm font-medium text-ink hover:bg-teal/10 hover:text-teal"
                              onClick={() => setServiciosOpen(false)}
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              ) : (
                <li key={link.href}>
                  <Link href={link.href} className="font-medium text-ink hover:text-teal">
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/cotizacion"
            className="flex items-center gap-2 rounded-full bg-teal-dark px-4 py-2 text-sm font-semibold text-white"
          >
            Cotización
            <motion.span
              key={totalCount}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1 text-xs text-teal-dark"
            >
              {totalCount}
            </motion.span>
          </Link>

          <button
            type="button"
            aria-expanded={open}
            aria-label="Abrir menú"
            onClick={() => setOpen((v) => !v)}
            className="flex flex-col gap-1.5 p-2 md:hidden"
          >
            <span className="block h-0.5 w-6 bg-teal-dark" />
            <span className="block h-0.5 w-6 bg-teal-dark" />
            <span className="block h-0.5 w-6 bg-teal-dark" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <ul className="flex flex-col gap-4 px-6 py-5">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <li key={link.label}>
                    <button
                      type="button"
                      aria-expanded={mobileServiciosOpen}
                      onClick={() => setMobileServiciosOpen((v) => !v)}
                      className="flex w-full items-center justify-between font-medium text-ink"
                    >
                      {link.label}
                      <svg
                        className={`h-3.5 w-3.5 transition-transform ${mobileServiciosOpen ? "rotate-180" : ""}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {mobileServiciosOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden pl-4"
                        >
                          {link.children.map((sub) => (
                            <li key={sub.href} className="pt-3">
                              <Link
                                href={sub.href}
                                className="font-medium text-ink/80"
                                onClick={() => {
                                  setOpen(false);
                                  setMobileServiciosOpen(false);
                                }}
                              >
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                ) : (
                  <li key={link.href}>
                    <Link href={link.href} className="font-medium text-ink" onClick={() => setOpen(false)}>
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
