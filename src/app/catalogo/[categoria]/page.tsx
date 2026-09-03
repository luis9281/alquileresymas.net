import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CatalogGrid from "@/components/CatalogGrid";
import { getCategorias, getProductos } from "@/lib/sanity/queries";

type Props = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria: slug } = await params;
  const categorias = await getCategorias();
  const categoria = categorias.find((c) => c.slug === slug);
  if (!categoria) return { title: "Catálogo | Alquileres Eventos & Más" };
  return {
    title: `${categoria.nombre} | Alquileres Eventos & Más`,
    description: `Renta de ${categoria.nombre.toLowerCase()} para eventos en Panamá. Fotos reales, entrega, montaje y desmontaje incluidos.`,
  };
}

export default async function CategoriaPage({ params }: Props) {
  const { categoria: slug } = await params;
  const categorias = await getCategorias();
  const categoria = categorias.find((c) => c.slug === slug);

  if (!categoria) notFound();

  const productos = await getProductos(slug);

  return (
    <>
      <section className="bg-teal-dark px-6 py-16 text-white">
        <div className="mx-auto max-w-[1350px]">
          <Link href="/catalogo" className="text-sm font-semibold uppercase tracking-wide text-lime">
            Catálogo
          </Link>
          <h1 className="mt-2 text-white">{categoria.nombre}</h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1350px] gap-10 px-6 py-16 md:grid-cols-[220px_1fr]">
        <aside>
          <h2 className="mb-4 text-lg">Categorías</h2>
          <ul className="space-y-2">
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/catalogo/${c.slug}`}
                  className={c.slug === slug ? "font-bold text-lime-dark" : "text-ink hover:text-teal"}
                >
                  {c.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <CatalogGrid productos={productos} />
      </section>
    </>
  );
}
