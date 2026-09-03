import Image from "next/image";
import Link from "next/link";

const SERVICIOS = [
  {
    numero: "01",
    titulo: "Planos del salón",
    texto: "Te ayudamos a visualizar la distribución de mesas y sillas antes del evento, para que sepas exactamente cómo se va a ver tu salón.",
    href: "/planos-del-salon",
  },
  {
    numero: "02",
    titulo: "Diseño de eventos",
    texto: "Asesoría en decoración, paleta de colores y montaje para que cada detalle combine con la visión que tienes para tu evento.",
    href: "/diseno-de-eventos",
  },
  {
    numero: "03",
    titulo: "Catálogo de productos",
    texto: "Explora todo nuestro mobiliario y equipo por categoría, con fotos reales, para armar tu lista de cotización.",
    href: "/catalogo",
  },
];

export default function ServiciosSection() {
  return (
    <section className="mx-auto max-w-[1350px] px-6 py-20">
      <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:items-start">
        <div className="aspect-[4/5] overflow-hidden rounded-md">
          <Image
            src="/eventos/salon-sillas-tiffany-1.jpg"
            alt="Salón amplio montado con mesas redondas y sillas Tiffany"
            width={800}
            height={1000}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-teal">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
            Nuestros servicios
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl">
            Planifica, diseña y monta tu evento sin complicaciones.
          </h2>
          <p className="mt-4 max-w-md text-muted">
            No solo alquilamos mobiliario: te acompañamos desde que imaginas tu evento hasta el
            último detalle del montaje, para que solo te preocupes de disfrutarlo.
          </p>
          <Link
            href="/cotizacion"
            className="mt-6 inline-flex rounded-md bg-teal-dark px-6 py-3 font-semibold text-white hover:bg-teal"
          >
            Solicitar cotización
          </Link>

          <div className="mt-10 border-t border-border">
            {SERVICIOS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-start gap-5 border-b border-border py-6"
              >
                <span className="pt-1 text-sm font-semibold text-lime-dark">{s.numero}</span>
                <div className="flex-1">
                  <h3 className="text-xl group-hover:text-teal">{s.titulo}</h3>
                  <p className="mt-1 text-muted">{s.texto}</p>
                </div>
                <span
                  className="pt-1 text-teal opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
