import Link from "next/link";
import Image from "next/image";
import type { Producto } from "@/lib/types";
import { esImagenSanity } from "@/lib/images";
import QuoteButton from "./QuoteButton";

export default function ProductCard({
  producto,
  varianteIdx = 0,
}: {
  producto: Producto;
  /** Which color/finish variant this card represents — each variant gets its own card. */
  varianteIdx?: number;
}) {
  const variante = producto.variantes[varianteIdx] ?? producto.variantes[0];
  const imagen = variante?.imagenes[0];
  const titulo = variante?.color ? `${producto.titulo} — ${variante.color}` : producto.titulo;
  const href = `/catalogo/${producto.categoria.slug}/${producto.slug}${
    variante?.color ? `?color=${encodeURIComponent(variante.color)}` : ""
  }`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-md border border-border bg-white">
      <Link href={href} className="block aspect-square overflow-hidden bg-border">
        {imagen ? (
          <Image
            src={imagen}
            alt={titulo}
            width={640}
            height={640}
            unoptimized={esImagenSanity(imagen)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-teal/20 to-lime/20" />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {producto.categoria.nombre}
        </span>
        <h3 className="text-base font-semibold text-teal-dark">
          <Link href={href}>{titulo}</Link>
        </h3>
        {typeof producto.precio === "number" && (
          <p className="text-sm font-semibold text-ink">${producto.precio.toFixed(2)}</p>
        )}
        <div className="mt-auto flex items-center gap-3 pt-2">
          <Link
            href={href}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-teal-dark hover:border-teal"
          >
            Ver detalle
          </Link>
          <QuoteButton producto={producto} colorSeleccionado={variante?.color} imagenSeleccionada={imagen} />
        </div>
      </div>
    </article>
  );
}
