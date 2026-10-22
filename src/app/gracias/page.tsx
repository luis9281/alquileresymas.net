import type { Metadata } from "next";
import Link from "next/link";
import { CONTACTO } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Gracias | Alquileres Eventos & Más",
  description: "Recibimos tu solicitud de cotización.",
  robots: { index: false, follow: false },
};

export default function GraciasPage() {
  return (
    <section className="bg-teal-dark px-6 py-24 text-center text-white sm:py-32">
      <div className="mx-auto max-w-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-lime/60 text-lime">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="mt-8 text-sm uppercase tracking-[0.25em] text-lime">Solicitud recibida</p>
        <h1 className="mt-3 text-white">Gracias por pensar en nosotros</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/85">
          Tu solicitud de cotización ya está en manos de nuestro equipo. La revisaremos con atención y
          te responderemos muy pronto, por correo o por teléfono, con una propuesta pensada para tu evento.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          Será un placer ayudarte a que cada detalle luzca como lo imaginas.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/catalogo"
            className="inline-flex rounded-md bg-lime px-7 py-3 font-semibold text-teal-dark hover:bg-lime-dark"
          >
            Seguir explorando el catálogo
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-md border border-white/40 px-7 py-3 font-semibold text-white hover:border-white"
          >
            Volver al inicio
          </Link>
        </div>

        <p className="mt-12 text-sm text-white/70">
          ¿Tu evento es pronto? Escríbenos por{" "}
          <a href={CONTACTO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-lime underline">
            WhatsApp al {CONTACTO.telefono}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
