"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Producto } from "@/lib/types";
import { aListados, tituloListado } from "@/lib/producto";

const CARD_CLASS =
  "group relative block aspect-[3/4] w-[270px] shrink-0 snap-start overflow-hidden rounded-md bg-border sm:w-[calc((100%-2.5rem)/3)]";

export default function CategoryShowcase({
  eyebrow,
  titulo,
  copy,
  verTodoHref,
  productos,
  video,
}: {
  eyebrow: string;
  titulo: string;
  copy: string;
  verTodoHref: string;
  productos: Producto[];
  /** Optional video shown as the first card, e.g. a short clip of a real event setup. */
  video?: { src: string; poster?: string };
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 1 | -1) {
    scrollRef.current?.scrollBy({ left: dir * scrollRef.current.clientWidth * 0.85, behavior: "smooth" });
  }

  const listados = aListados(productos);

  if (listados.length === 0 && !video) return null;

  return (
    <section className="mx-auto max-w-[1350px] px-6 py-20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal">{eyebrow}</p>
          <h2 className="mt-2 text-3xl">{titulo}</h2>
          <p className="mt-3 text-muted">{copy}</p>
        </div>

        <div className="flex items-center gap-5">
          <Link href={verTodoHref} className="whitespace-nowrap text-sm font-semibold text-teal hover:text-lime-dark">
            Ver catálogo completo →
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Anterior"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-teal-dark hover:border-teal"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Siguiente"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-teal-dark hover:border-teal"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2">
        {video && (
          <div className={CARD_CLASS}>
            <video
              src={video.src}
              poster={video.poster}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {listados.map(({ producto: p, varianteIdx }) => {
          const variante = p.variantes[varianteIdx];
          const imagen = variante?.imagenes[0];
          const titulo = tituloListado({ producto: p, varianteIdx });
          const href = `/catalogo/${p.categoria.slug}/${p.slug}${
            variante?.color ? `?color=${encodeURIComponent(variante.color)}` : ""
          }`;
          return (
            <Link key={`${p._id}-${varianteIdx}`} href={href} className={CARD_CLASS}>
              {imagen ? (
                <Image
                  src={imagen}
                  alt={titulo}
                  fill
                  sizes="(max-width: 640px) 270px, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-teal/20 to-lime/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-transparent" />
              <span className="absolute bottom-4 left-4 right-4 font-semibold text-white">{titulo}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
