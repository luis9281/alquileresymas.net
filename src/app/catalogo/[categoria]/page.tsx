import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CatalogGrid from "@/components/CatalogGrid";
import CategoriasSidebar from "@/components/CategoriasSidebar";
import { getCategorias, getProductos } from "@/lib/sanity/queries";
import { productosDe, subcategoriasDe, urlSeleccion } from "@/lib/categorias";
import type { Producto } from "@/lib/types";
import { formatoPrecio } from "@/lib/precio";
import { imagenPrincipal } from "@/lib/producto";

type Props = {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/** ?sub=redondos&tipo=corrugado -> the matching entries; unknown values fall back to the level above. */
function seleccion(productos: Producto[], sub: unknown, tipo: unknown) {
  const subcategorias = subcategoriasDe(productos);
  const subActiva = subcategorias.find((s) => s.slug === sub);
  const tipoActivo = subActiva?.tipos.find((t) => t.slug === tipo);
  return { subcategorias, subActiva, tipoActivo };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { categoria: slug } = await params;
  const { sub, tipo } = await searchParams;
  const categorias = await getCategorias();
  const categoria = categorias.find((c) => c.slug === slug);
  if (!categoria) return { title: "Catálogo | Alquileres Eventos & Más" };

  // ?sub=servilletas (and ?tipo=corrugado inside it) get their own title/description/canonical
  // so they can rank on their own.
  const todos = await getProductos(slug);
  const { subActiva, tipoActivo } = seleccion(todos, sub, tipo);
  if (subActiva) {
    const productos = productosDe(todos, subActiva.slug, tipoActivo?.slug);
    const precios = productos.map((p) => p.precio).filter((p): p is number => typeof p === "number");
    const desde = precios.length ? ` Desde ${formatoPrecio(Math.min(...precios))}.` : "";
    const imagen = productos[0] && imagenPrincipal(productos[0]);
    const cantidad = tipoActivo?.cantidad ?? subActiva.cantidad;
    return {
      title: tipoActivo
        ? `${subActiva.nombre} · ${tipoActivo.nombre} | ${categoria.nombre} | Alquileres Eventos & Más`
        : `${subActiva.nombre} | ${categoria.nombre} | Alquileres Eventos & Más`,
      description: tipoActivo
        ? `${categoria.nombre} › ${subActiva.nombre} › ${tipoActivo.nombre}: ${cantidad} opciones para eventos en Panamá, con fotos reales.${desde} Entrega, montaje y desmontaje incluidos.`
        : `Renta de ${subActiva.nombre.toLowerCase()} para eventos en Panamá: ${cantidad} opciones con fotos reales.${desde} Entrega, montaje y desmontaje incluidos.`,
      alternates: { canonical: urlSeleccion(slug, subActiva.slug, tipoActivo?.slug) },
      openGraph: imagen ? { images: [imagen] } : undefined,
    };
  }

  return {
    title: `${categoria.nombre} | Alquileres Eventos & Más`,
    description: `Renta de ${categoria.nombre.toLowerCase()} para eventos en Panamá. Fotos reales, entrega, montaje y desmontaje incluidos.`,
    alternates: { canonical: `/catalogo/${slug}` },
    // Category cover as the preview image when the link is shared (WhatsApp, Facebook...).
    openGraph: categoria.imagen ? { images: [categoria.imagen] } : undefined,
  };
}

export default async function CategoriaPage({ params, searchParams }: Props) {
  const { categoria: slug } = await params;
  const { sub, tipo } = await searchParams;
  const categorias = await getCategorias();
  const categoria = categorias.find((c) => c.slug === slug);

  if (!categoria) notFound();

  const productos = await getProductos(slug);
  const { subcategorias, subActiva, tipoActivo } = seleccion(productos, sub, tipo);
  const visibles = subActiva ? productosDe(productos, subActiva.slug, tipoActivo?.slug) : productos;

  return (
    <>
      <section className="bg-teal-dark px-6 py-16 text-white">
        <div className="mx-auto max-w-[1350px]">
          <Link href="/catalogo" className="text-sm font-semibold uppercase tracking-wide text-lime">
            Catálogo
          </Link>
          <h1 className="mt-2 text-white">{categoria.nombre}</h1>
          {subActiva && (
            <p className="mt-1 text-lg text-white/80">
              {subActiva.nombre}
              {tipoActivo && ` · ${tipoActivo.nombre}`}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1350px] gap-10 px-6 py-16 md:grid-cols-[220px_1fr]">
        <CategoriasSidebar
          categorias={categorias}
          activa={slug}
          subcategorias={subcategorias}
          subActiva={subActiva?.slug}
          tipoActivo={tipoActivo?.slug}
          totalActiva={productos.reduce((n, p) => n + Math.max(1, p.variantes.length), 0)}
        />

        <CatalogGrid key={`${slug}-${subActiva?.slug ?? ""}-${tipoActivo?.slug ?? ""}`} productos={visibles} filtroPrecio filtroColor />
      </section>
    </>
  );
}
