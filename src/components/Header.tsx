"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuote } from "./QuoteContext";
import type { Categoria } from "@/lib/types";

type SubLink = { href: string; label: string };
type NavLink =
  | { href: string; label: string; children?: undefined }
  // href on a parent with children: the label itself is a link, the chevron opens the submenu.
  | { href?: string; label: string; children: SubLink[]; compacto?: boolean };

const SERVICIOS_LINKS: SubLink[] = [
  { href: "/planos-del-salon", label: "Planos del Salón" },
  { href: "/diseno-de-eventos", label: "Diseño de Eventos" },
  { href: "/catalogo", label: "Catálogo de Productos" },
];

// Subcategories popular enough to get their own entry in the Catálogo menu
// (listed only while their parent category is visible).
const SUBCATEGORIAS_MENU: (SubLink & { categoria: string })[] = [
  { categoria: "manteleria", href: "/catalogo/manteleria?sub=servilletas", label: "Servilletas" },
];

function navLinks(categorias: Pick<Categoria, "slug" | "nombre">[]): NavLink[] {
  const catalogo: SubLink[] = [
    ...categorias.map((c) => ({ href: `/catalogo/${c.slug}`, label: c.nombre })),
    ...SUBCATEGORIAS_MENU.filter((s) => categorias.some((c) => c.slug === s.categoria)).map(({ href, label }) => ({
      href,
      label,
    })),
  ].sort((a, b) => a.label.localeCompare(b.label, "es"));
  return [
    { href: "/", label: "Inicio" },
    { href: "/catalogo", label: "Catálogo", compacto: true, children: catalogo },
    { label: "Servicios", children: SERVICIOS_LINKS },
    { href: "/cotizador-rapido", label: "Cotizador Rápido" },
    { href: "/blog", label: "Blog" },
    { href: "/nosotros", label: "Nosotros" },
    { href: "/contacto", label: "Contacto" },
  ];
}

function Chevron({ abierto }: { abierto: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 transition-transform ${abierto ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Header({ categorias }: { categorias: Pick<Categoria, "slug" | "nombre">[] }) {
  const [open, setOpen] = useState(false);
  // Label of the open desktop / mobile submenu, if any.
  const [submenu, setSubmenu] = useState<string | null>(null);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { totalCount } = useQuote();
  const links = navLinks(categorias);

  const openSubmenu = (label: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setSubmenu(label);
  };
  const scheduleCloseSubmenu = () => {
    closeTimeout.current = setTimeout(() => setSubmenu(null), 150);
  };
  const toggle = (actual: string | null, label: string) => (actual === label ? null : label);
  const closeMobile = () => {
    setOpen(false);
    setMobileSubmenu(null);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-cream/95 backdrop-blur">
      {/* Phones: smaller logo and gutters so logo + Cotización + menu fit in 360px without sideways scroll. */}
      <div className="mx-auto flex max-w-[1350px] items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="Alquileres Eventos & Más" width={274} height={60} className="h-9 w-auto sm:h-12" priority />
        </Link>

        <nav className="hidden lg:block">
          <ul className="flex items-center gap-5 xl:gap-7">
            {links.map((link) =>
              link.children ? (
                <li
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => openSubmenu(link.label)}
                  onMouseLeave={scheduleCloseSubmenu}
                >
                  {link.href ? (
                    <span className="flex items-center gap-1">
                      <Link
                        href={link.href}
                        className="font-medium text-ink hover:text-teal"
                        onClick={() => setSubmenu(null)}
                      >
                        {link.label}
                      </Link>
                      <button
                        type="button"
                        aria-expanded={submenu === link.label}
                        aria-label={`Ver ${link.label.toLowerCase()} por categoría`}
                        onClick={() => setSubmenu((v) => toggle(v, link.label))}
                        className="text-ink hover:text-teal"
                      >
                        <Chevron abierto={submenu === link.label} />
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      aria-expanded={submenu === link.label}
                      onClick={() => setSubmenu((v) => toggle(v, link.label))}
                      className="flex items-center gap-1 font-medium text-ink hover:text-teal"
                    >
                      {link.label}
                      <Chevron abierto={submenu === link.label} />
                    </button>
                  )}
                  <AnimatePresence>
                    {submenu === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute left-0 top-full mt-2 rounded-xl border border-border bg-cream py-2 shadow-lg ${
                          link.compacto ? "w-[420px]" : "min-w-[220px]"
                        }`}
                      >
                        {link.compacto && link.href && (
                          <Link
                            href={link.href}
                            className="mx-2 mb-1 block border-b border-border px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-teal hover:text-teal-dark"
                            onClick={() => setSubmenu(null)}
                          >
                            Ver todo el {link.label.toLowerCase()} →
                          </Link>
                        )}
                        <ul className={link.compacto ? "grid grid-cols-2 px-2" : undefined}>
                          {link.children.map((sub) => (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className={
                                  link.compacto
                                    ? "block rounded-md px-2 py-1.5 text-[13px] text-ink hover:bg-teal/10 hover:text-teal"
                                    : "block px-4 py-2 text-sm font-medium text-ink hover:bg-teal/10 hover:text-teal"
                                }
                                onClick={() => setSubmenu(null)}
                              >
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
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

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/cotizacion"
            className="flex min-h-11 items-center gap-1.5 rounded-full bg-teal-dark px-3 text-sm font-semibold text-white sm:gap-2 sm:px-4 lg:min-h-10"
          >
            {/* Under 400px the word gives way to an icon; it stays as the link's accessible name. */}
            <svg
              className="h-5 w-5 min-[400px]:hidden"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 4.5h6M9 4.5a1.5 1.5 0 0 0 0 3h6a1.5 1.5 0 0 0 0-3M9 4.5H7.5A1.5 1.5 0 0 0 6 6v13.5A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H15" />
              <path d="M9 12h6M9 15.5h4" />
            </svg>
            <span className="max-[399px]:sr-only">Cotización</span>
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
            className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden"
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
            className="max-h-[calc(100dvh-69px)] overflow-y-auto border-t border-border sm:max-h-[calc(100dvh-73px)] lg:hidden"
          >
            <ul className="flex flex-col px-4 py-3 sm:px-6">
              {links.map((link) =>
                link.children ? (
                  <li key={link.label}>
                    <div className="flex w-full items-center justify-between">
                      {link.href ? (
                        <Link href={link.href} className="flex min-h-11 flex-1 items-center font-medium text-ink" onClick={closeMobile}>
                          {link.label}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setMobileSubmenu((v) => toggle(v, link.label))}
                          className="flex min-h-11 flex-1 items-center font-medium text-ink"
                        >
                          {link.label}
                        </button>
                      )}
                      <button
                        type="button"
                        aria-expanded={mobileSubmenu === link.label}
                        aria-label={`Mostrar ${link.label.toLowerCase()}`}
                        onClick={() => setMobileSubmenu((v) => toggle(v, link.label))}
                        className="-mr-3 flex h-11 w-11 items-center justify-center text-ink"
                      >
                        <Chevron abierto={mobileSubmenu === link.label} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {mobileSubmenu === link.label && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className={`overflow-hidden pb-2 pl-4 ${link.compacto ? "grid grid-cols-2 gap-x-3" : ""}`}
                        >
                          {link.children.map((sub) => (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className={`flex min-h-11 items-center ${link.compacto ? "text-sm text-ink/80" : "font-medium text-ink/80"}`}
                                onClick={closeMobile}
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
                    <Link href={link.href} className="flex min-h-11 items-center font-medium text-ink" onClick={() => setOpen(false)}>
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
