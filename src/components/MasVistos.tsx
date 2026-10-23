import Link from "next/link";
import Image from "next/image";
import type { Producto } from "@/lib/types";
import { imagenPrincipal } from "@/lib/producto";
import { esImagenSanity } from "@/lib/images";
import { formatoPrecio } from "@/lib/precio";

/** Compact strip of the week's most viewed products (see lib/vistas.ts). */
export default function MasVistos({ productos, conDatos }: { productos: Producto[]; conDatos: boolean }) {
  if (productos.length === 0) return null;

  return (
    <section className="bg-teal-dark/[0.04]">
      <div className="mx-auto max-w-[1350px] px-6 py-12">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal">
              {conDatos ? "Tendencia de la semana" : "Para inspirarte"}
            </p>
            <h2 className="mt-1 text-2xl">{conDatos ? "Lo más visto esta semana" : "Favoritos para tu próximo evento"}</h2>
            <p className="mt-2 text-sm text-muted">
              {conDatos
                ? "Esto es lo que más están mirando quienes ya planean su evento. ¿Ya lo tienes en tu cotización? La lista se renueva cada lunes."
                : "Una selección de lo que más luce en bodas, cumpleaños y eventos corporativos. Agrégalo a tu cotización en un clic."}
            </p>
          </div>
        </div>

        <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {productos.map((p, i) => {
            const imagen = imagenPrincipal(p);
            return (
              <li key={p._id}>
                <Link href={`/catalogo/${p.categoria.slug}/${p.slug}`} className="group block">
                  <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-white">
                    {imagen ? (
                      <Image
                        src={imagen}
                        alt={p.titulo}
                        fill
                        unoptimized={esImagenSanity(imagen)}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 160px"
                        className="object-contain p-1 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-teal/20 to-lime/20" />
                    )}
                    <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal-dark text-xs font-semibold text-white">
                      {i + 1}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-teal-dark group-hover:text-teal">
                    {p.titulo}
                  </p>
                  {typeof p.precio === "number" && (
                    <p className="text-xs text-muted">Desde {formatoPrecio(p.precio)}</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
