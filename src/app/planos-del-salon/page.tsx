import type { Metadata } from "next";
import FloorPlanner from "@/components/floorplan/FloorPlanner";

export const metadata: Metadata = {
  title: "Planos del Salón | Alquileres Eventos & Más",
  description:
    "Herramienta interactiva para armar la distribución de mesas, sillas y áreas de tu evento antes de que llegue el primer invitado.",
  alternates: { canonical: "/planos-del-salon" },
};

export default function PlanosDelSalonPage() {
  return (
    <>
      <section className="bg-teal-dark px-6 py-16 text-white">
        <div className="mx-auto max-w-[1350px]">
          <h1 className="text-white">Planos del Salón</h1>
          <p className="mt-2 max-w-xl text-white/80">
            Ingresa las medidas de tu salón y el número de invitados, arma tu distribución
            arrastrando mesas, sillas y otros elementos, y te decimos si el espacio alcanza.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1350px] px-6 py-16">
        <FloorPlanner />
      </section>
    </>
  );
}
