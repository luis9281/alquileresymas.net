import Link from "next/link";
import Image from "next/image";
import type { Categoria } from "@/lib/types";
import { esImagenSanity } from "@/lib/images";

const FALLBACK_IMAGES: Record<string, string> = {
  "bares-counters-podiums": "/muestras/bares-counters-podiums/bar-elegante-blanco-card.jpg",
  cristaleria: "/muestras/cristaleria/copa-de-vino.jpg",
  mesas: "/muestras/mesas/mesa-nova-luxe-blanca.jpg",
  "salas-lounge": "/muestras/salas-lounge/puff-led-rgb.jpg",
  sillas: "/muestras/sillas/crossback.jpg",
};

export default function CategoryCard({
  categoria,
  imagen,
}: {
  categoria: Categoria;
  imagen?: string;
}) {
  const src = imagen ?? FALLBACK_IMAGES[categoria.slug];

  return (
    <Link
      href={`/catalogo/${categoria.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-cream transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-teal hover:shadow-xl hover:shadow-teal-dark/10"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            unoptimized={esImagenSanity(src)}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cream to-border/40 p-8">
            <Image
              src="/logo.png"
              alt=""
              width={1249}
              height={273}
              className="w-full max-w-[140px] object-contain opacity-70 transition-all duration-500 ease-out group-hover:scale-110 group-hover:opacity-100"
            />
          </div>
        )}
        {/* Realce sutil al pasar el cursor */}
        <div className="absolute inset-0 bg-teal-dark/0 transition-colors duration-500 group-hover:bg-teal-dark/10" />
        {/* Destello diagonal que recorre la imagen */}
        <div className="pointer-events-none absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[150%]" />
      </div>
      <div className="relative flex min-h-[4rem] flex-col items-center justify-center border-t border-border px-3 py-3 text-center">
        <span className="text-sm font-semibold leading-tight tracking-tight text-ink transition-all duration-300 sm:text-base group-hover:tracking-wide group-hover:text-teal">
          {categoria.nombre}
        </span>
        <span
          aria-hidden
          className="mx-auto mt-1.5 block h-px w-0 bg-lime transition-all duration-500 ease-out group-hover:w-10"
        />
      </div>
    </Link>
  );
}
