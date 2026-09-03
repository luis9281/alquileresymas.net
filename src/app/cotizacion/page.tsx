import type { Metadata } from "next";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Cotización | Alquileres Eventos & Más",
  description: "Arma tu lista de mobiliario y equipo para tu evento y solicita una cotización sin compromiso, por correo o WhatsApp.",
};

export default function CotizacionPage() {
  return (
    <>
      <section className="bg-teal-dark px-6 py-16 text-white">
        <div className="mx-auto max-w-[1350px]">
          <h1 className="text-white">Cotización</h1>
          <p className="mt-2 max-w-xl text-white/80">
            Revisa los productos que elegiste y cuéntanos sobre tu evento. Te responderemos con una
            cotización, sin ningún pago en línea.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1350px] px-6 py-16">
        <QuoteForm />
      </section>
    </>
  );
}
