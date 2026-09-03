"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuote } from "./QuoteContext";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/blog", label: "Blog" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { totalCount } = useQuote();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1350px] items-center justify-between gap-6 px-6 py-3">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="Alquileres Eventos & Más" width={274} height={60} className="h-12 w-auto" priority />
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="font-medium text-ink hover:text-teal">
                  {link.label}
                </Link>
              </li>
            ))}
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
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-medium text-ink" onClick={() => setOpen(false)}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
