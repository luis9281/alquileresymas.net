import type { Metadata } from "next";
import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import { CONTACTO } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Contacto | Alquileres Eventos & Más",
  description: "Teléfono, WhatsApp, correo, ubicación y horario de Alquileres Eventos & Más en Ciudad de Panamá.",
};

export default function ContactoPage() {
  return (
    <>
      <section className="bg-teal-dark px-6 py-16 text-white">
        <div className="mx-auto max-w-[1350px]">
          <h1 className="text-white">Contacto</h1>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <ul className="space-y-3 text-lg">
          <li>
            <strong>Teléfono / WhatsApp:</strong>{" "}
            <a href={CONTACTO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-teal">
              {CONTACTO.telefono}
            </a>
          </li>
          <li>
            <strong>Gerencia:</strong>{" "}
            <a href={`mailto:${CONTACTO.emails.gerencia}`} className="text-teal">{CONTACTO.emails.gerencia}</a>
          </li>
          <li>
            <strong>Ventas:</strong>{" "}
            <a href={`mailto:${CONTACTO.emails.ventas}`} className="text-teal">{CONTACTO.emails.ventas}</a>
            {", "}
            <a href={`mailto:${CONTACTO.emails.ventas1}`} className="text-teal">{CONTACTO.emails.ventas1}</a>
          </li>
          <li>
            <strong>Ubicación:</strong>{" "}
            <a href={CONTACTO.mapaUrl} target="_blank" rel="noopener noreferrer" className="text-teal underline">
              {CONTACTO.direccion}
            </a>
          </li>
          <li>
            <strong>Horario:</strong>
            <ul className="mt-1 text-base text-ink/90">
              {CONTACTO.horario.map((h) => (
                <li key={h.dias}>{h.dias}: {h.horas}</li>
              ))}
            </ul>
          </li>
          <li>
            <strong>Síguenos:</strong>
            <SocialLinks className="mt-2 flex items-center gap-4 text-teal-dark" />
          </li>
        </ul>

        <div className="mt-8 aspect-video w-full overflow-hidden rounded-md border border-border">
          <iframe
            src={CONTACTO.mapaEmbedUrl}
            title="Ubicación de Alquileres Eventos & Más"
            loading="lazy"
            className="h-full w-full border-0"
          />
        </div>

        <p className="mt-8 text-muted">
          ¿Ya sabes qué necesitas? Es más rápido armar tu lista en el{" "}
          <Link href="/catalogo" className="text-teal underline">catálogo</Link> y enviarla desde{" "}
          <Link href="/cotizacion" className="text-teal underline">cotización</Link>.
        </p>
      </section>
    </>
  );
}
