import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Planos del Salón | Alquileres Eventos & Más",
  description: "Visualiza la distribución de mesas, sillas y áreas de tu evento antes de que llegue el primer invitado.",
};

export default function PlanosDelSalonPage() {
  return (
    <>
      <section className="bg-teal-dark px-6 py-16 text-white">
        <div className="mx-auto max-w-[1350px]">
          <h1 className="text-white">Planos del Salón</h1>
          <p className="mt-2 max-w-xl text-white/80">
            Visualiza la distribución de tu evento antes de que llegue el primer invitado.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-lg text-ink/90">
          Antes de confirmar tu pedido, te ayudamos a pensar cómo se va a ver tu salón: cuántas
          mesas y sillas caben cómodamente, dónde ubicar el bar, la pista o el área de fotos, y qué
          recorrido van a tener tus invitados. Así llegas al día del evento sin sorpresas.
        </p>
        <p className="mt-4 text-lg text-ink/90">
          Cuéntanos las medidas de tu salón y el número de invitados, y te ayudamos a definir el
          layout junto con tu lista de mobiliario.
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
