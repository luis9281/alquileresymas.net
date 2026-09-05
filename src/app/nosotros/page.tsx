import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import { CONTACTO } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Nosotros | Alquileres Eventos & Más",
  description:
    "Alquiler de sillas, mesas, bares y mobiliario para eventos en Panamá, con transporte propio, montaje y desmontaje incluidos.",
  alternates: { canonical: "/nosotros" },
};

const RAZONES = [
  {
    letra: "A",
    titulo: "Catálogo completo, en un solo lugar",
    texto:
      "Sillas, mesas, bares, cristalería, decoración, salas lounge y más. Arma todo tu evento con un solo proveedor, en lugar de coordinar cinco alquileres distintos.",
    imagen: "/muestras/mesas/mesa-nova-luxe-blanca.jpg",
  },
  {
    letra: "B",
    titulo: "Transporte propio para tu equipo",
    texto:
      "Contamos con camiones propios para el traslado de mobiliario y equipo a cualquier punto de la ciudad o del interior. Nosotros nos encargamos de que todo llegue completo y a tiempo — tú solo recibes.",
    imagen: "/nosotros/transporte-camion.jpg",
  },
  {
    letra: "C",
    titulo: "Montaje y desmontaje incluidos",
    texto:
      "Nuestro equipo instala y retira el mobiliario el mismo día del evento. No tienes que mover ni una silla, ni preocuparte por la limpieza al final.",
    imagen: "/eventos/corporativos/evento-corporativo-2.jpg",
  },
  {
    letra: "D",
    titulo: "Atención personalizada, sin compromiso",
    texto:
      "Te asesoramos según el tipo y tamaño de tu evento, y te enviamos una cotización clara — sin pagos en línea ni letra pequeña.",
    imagen: "/eventos/eventos/salon-sillas-tiffany-1.jpg",
  },
];

const VENTAJAS = [
  "Cobertura en toda Panamá",
  "Cotización en minutos, sin compromiso",
  "Entrega, montaje y recogida incluidos",
  "Bodas, corporativos, quinceañeras y celebraciones sociales",
];

export default function NosotrosPage() {
  return (
    <>
      <section className="bg-teal-dark px-6 py-16 text-white">
        <div className="mx-auto max-w-[1350px]">
          <h1 className="text-white">Nosotros</h1>
          <p className="mt-2 max-w-xl text-white/80">
            Detrás de cada evento en Panamá que ves bien montado, probablemente hay un camión,
            un equipo y una lista de mobiliario que salió de aquí.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1350px] px-6 py-20">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div className="aspect-[4/5] overflow-hidden rounded-md">
            <Image
              src="/eventos/mesas/decoracion-evento-1.jpg"
              alt="Montaje elegante de mesa para boda, con decoración floral"
              width={800}
              height={1000}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-teal">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
              Quiénes somos
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Tu evento, resuelto de principio a fin</h2>
            <p className="mt-4 text-muted">
              En Alquileres Eventos &amp; Más nos dedicamos a una sola cosa: que el mobiliario y
              equipo de tu evento aparezcan en el lugar correcto, a la hora correcta, y se vean
              impecables. Trabajamos bodas, quinceañeras, eventos corporativos, baby showers y
              todo tipo de celebración social en toda la provincia de Panamá.
            </p>
            <p className="mt-4 text-muted">
              Desde una silla Tiffany hasta un salón completo para cientos de invitados, nuestro
              catálogo y nuestro equipo de logística están armados para que no tengas que
              preocuparte por los detalles operativos — solo por disfrutar tu evento.
            </p>
            <Link
              href="/catalogo"
              className="mt-6 inline-flex rounded-md bg-teal-dark px-6 py-3 font-semibold text-white hover:bg-teal"
            >
              Ver catálogo de productos
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-[1350px]">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-teal">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
              Por qué elegirnos
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl">La diferencia está en el servicio completo</h2>
            <p className="mt-4 text-muted">
              Cualquiera puede rentar sillas. La pregunta es quién resuelve todo lo demás:
              transporte, montaje, tiempos de entrega y una cotización clara desde el primer
              mensaje.
            </p>
          </div>

          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            {RAZONES.map((r) => (
              <div key={r.letra} className="flex flex-col overflow-hidden rounded-md border border-border">
                <div className="relative aspect-[3/2] w-full">
                  <Image src={r.imagen} alt="" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <span className="text-sm font-semibold text-lime-dark">{r.letra}</span>
                  <h3 className="text-xl">{r.titulo}</h3>
                  <p className="text-muted">{r.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1350px] px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VENTAJAS.map((v) => (
            <div key={v} className="flex items-start gap-3 rounded-md border border-border bg-white p-5">
              <span className="mt-0.5 text-lime-dark" aria-hidden="true">✓</span>
              <span className="font-semibold text-ink">{v}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Las fechas de temporada alta (bodas de fin de semana, diciembre) se llenan rápido —
          entre más pronto cotices, más opciones de fecha e inventario tienes disponibles.
        </p>
      </section>

      <section className="bg-teal-dark px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-white">¿Listo para armar tu evento?</h2>
          <p className="mt-3 text-white/80">
            Explora el catálogo completo o cuéntanos qué necesitas y te enviamos una cotización
            hoy mismo, sin compromiso.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/catalogo"
              className="rounded-md bg-lime px-6 py-3 font-semibold text-teal-dark hover:bg-lime-dark"
            >
              Ver catálogo
            </Link>
            <Link
              href="/cotizacion"
              className="rounded-md border-2 border-white px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              Solicitar cotización
            </Link>
            <a
              href={CONTACTO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-[#25D366] px-6 py-3 font-semibold text-white hover:brightness-95"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-teal">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
          Hablemos
        </p>
        <h2 className="mt-3 text-3xl">¿Prefieres contactarnos directo?</h2>
        <ul className="mt-6 space-y-3 text-lg">
          <li>
            <strong>Teléfono / WhatsApp:</strong>{" "}
            <a href={CONTACTO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-teal">
              {CONTACTO.telefono}
            </a>
          </li>
          <li>
            <strong>Correo:</strong>{" "}
            <a href={`mailto:${CONTACTO.emails.ventas}`} className="text-teal">{CONTACTO.emails.ventas}</a>
          </li>
          <li>
            <strong>Ubicación:</strong>{" "}
            <a href={CONTACTO.mapaUrl} target="_blank" rel="noopener noreferrer" className="text-teal underline">
              {CONTACTO.direccion}
            </a>
          </li>
          <li>
            <strong>Síguenos:</strong>
            <SocialLinks className="mt-2 flex items-center gap-4 text-teal-dark" />
          </li>
        </ul>
        <p className="mt-6">
          <Link href="/contacto" className="font-semibold text-teal underline">
            Ver toda la información de contacto →
          </Link>
        </p>
      </section>
    </>
  );
}
