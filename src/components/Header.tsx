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
      <div className="mx-auto flex max-w-[1350px] items-center justify-between gap-6 px-6 py-3">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="Alquileres Eventos & Más" width={274} height={60} className="h-12 w-auto" priority />
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-7">
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
            className="max-h-[calc(100dvh-73px)] overflow-y-auto border-t border-border md:hidden"
          >
            <ul className="flex flex-col gap-4 px-6 py-5">
              {links.map((link) =>
                link.children ? (
                  <li key={link.label}>
                    <div className="flex w-full items-center justify-between">
                      {link.href ? (
                        <Link href={link.href} className="font-medium text-ink" onClick={closeMobile}>
                          {link.label}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setMobileSubmenu((v) => toggle(v, link.label))}
                          className="font-medium text-ink"
                        >
                          {link.label}
                        </button>
                      )}
                      <button
                        type="button"
                        aria-expanded={mobileSubmenu === link.label}
                        aria-label={`Mostrar ${link.label.toLowerCase()}`}
                        onClick={() => setMobileSubmenu((v) => toggle(v, link.label))}
                        className="p-1 text-ink"
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
                          className={`overflow-hidden pl-4 ${link.compacto ? "grid grid-cols-2 gap-x-3" : ""}`}
                        >
                          {link.children.map((sub) => (
                            <li key={sub.href} className={link.compacto ? "pt-2" : "pt-3"}>
                              <Link
                                href={sub.href}
                                className={link.compacto ? "text-sm text-ink/80" : "font-medium text-ink/80"}
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
