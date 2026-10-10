import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CatalogGrid from "@/components/CatalogGrid";
import CategoriasSidebar from "@/components/CategoriasSidebar";
import { getCategorias, getProductos } from "@/lib/sanity/queries";
import { slugSubcategoria, subcategoriasDe } from "@/lib/categorias";

type Props = {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria: slug } = await params;
  const categorias = await getCategorias();
  const categoria = categorias.find((c) => c.slug === slug);
  if (!categoria) return { title: "Catálogo | Alquileres Eventos & Más" };
  return {
    title: `${categoria.nombre} | Alquileres Eventos & Más`,
    description: `Renta de ${categoria.nombre.toLowerCase()} para eventos en Panamá. Fotos reales, entrega, montaje y desmontaje incluidos.`,
    alternates: { canonical: `/catalogo/${slug}` },
  };
}

export default async function CategoriaPage({ params, searchParams }: Props) {
  const { categoria: slug } = await params;
  const { sub } = await searchParams;
  const categorias = await getCategorias();
  const categoria = categorias.find((c) => c.slug === slug);

  if (!categoria) notFound();

  const productos = await getProductos(slug);
  const subcategorias = subcategoriasDe(productos);
  // ?sub=copas -> only that subcategory; unknown values fall back to the whole category.
  const subActiva = subcategorias.find((s) => s.slug === sub);
  const visibles = subActiva
    ? productos.filter((p) => p.subcategoria && slugSubcategoria(p.subcategoria) === subActiva.slug)
    : productos;

  return (
    <>
      <section className="bg-teal-dark px-6 py-16 text-white">
        <div className="mx-auto max-w-[1350px]">
          <Link href="/catalogo" className="text-sm font-semibold uppercase tracking-wide text-lime">
            Catálogo
          </Link>
          <h1 className="mt-2 text-white">{categoria.nombre}</h1>
          {subActiva && <p className="mt-1 text-lg text-white/80">{subActiva.nombre}</p>}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1350px] gap-10 px-6 py-16 md:grid-cols-[220px_1fr]">
        <CategoriasSidebar
          categorias={categorias}
          activa={slug}
          subcategorias={subcategorias}
          subActiva={subActiva?.slug}
        />

        <CatalogGrid key={`${slug}-${subActiva?.slug ?? ""}`} productos={visibles} filtroPrecio filtroColor />
      </section>
    </>
  );
}
