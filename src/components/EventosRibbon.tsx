import Image from "next/image";
import Link from "next/link";
import { obtenerFotosEventos } from "@/lib/eventos-fotos";

export default function EventosRibbon({
  categorias,
  eyebrow,
  titulo,
  ctaHref,
  ctaLabel,
}: {
  categorias: string[];
  eyebrow: string;
  titulo: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  const fotos = obtenerFotosEventos(categorias);
  if (fotos.length === 0) return null;

  // Se repite la tira una vez para que el loop del marquee sea continuo (sin salto visible).
  const tira = [...fotos, ...fotos];

  return (
    <section className="my-16 sm:my-20">
      <div className="mx-auto flex max-w-[1350px] flex-col gap-4 px-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-teal">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 className="mt-2 text-3xl">{titulo}</h2>
        </div>
        <Link
          href={ctaHref}
          className="inline-flex shrink-0 rounded-md bg-teal-dark px-5 py-2 text-sm font-semibold text-white hover:bg-teal"
        >
          {ctaLabel}
        </Link>
      </div>

      <div className="mt-8 overflow-hidden">
        <div className="flex w-max animate-marquee">
          {tira.map((foto, i) => (
            <div key={i} className="relative h-64 w-[22rem] shrink-0">
              <Image src={foto.src} alt={foto.alt} fill sizes="352px" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
