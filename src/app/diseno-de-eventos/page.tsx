import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Diseño de Eventos | Alquileres Eventos & Más",
  description: "Asesoría en decoración, paleta de colores y montaje para que el mobiliario de tu evento combine con tu visión.",
  alternates: { canonical: "/diseno-de-eventos" },
};

export default function DisenoDeEventosPage() {
  return (
    <>
      <section className="bg-teal-dark px-6 py-16 text-white">
        <div className="mx-auto max-w-[1350px]">
          <h1 className="text-white">Diseño de Eventos</h1>
          <p className="mt-2 max-w-xl text-white/80">
            Asesoría en decoración y montaje para que cada detalle combine con tu visión.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-lg text-ink/90">
          Con tantas opciones de mobiliario, colores y acabados, elegir puede ser abrumador. Te
          ayudamos a combinar mesas, sillas y decoración según el estilo de tu evento — desde una
          boda elegante hasta un evento corporativo — para lograr un ambiente coherente de
          principio a fin.
        </p>
        <p className="mt-4 text-lg text-ink/90">
          Cuéntanos el estilo que buscas (elegante, moderno, rústico, corporativo) y te
          recomendamos las combinaciones de nuestro catálogo que mejor le quedan a tu evento.
        </p>
        <Link
          href="/cotizacion"
          className="mt-8 inline-flex rounded-md bg-lime px-6 py-3 font-semibold text-teal-dark hover:bg-lime-dark"
        >
          Solicitar cotización
        </Link>
      </section>
    </>
  );
}
