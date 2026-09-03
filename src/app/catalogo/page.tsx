import type { Metadata } from "next";
import Link from "next/link";
import CatalogGrid from "@/components/CatalogGrid";
import { getCategorias, getProductos } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Catálogo | Alquileres Eventos & Más",
  description: "Sillas, mesas, bares, cristalería, decoración y más mobiliario para renta de eventos en Panamá, por categoría.",
};

export default async function CatalogoPage() {
  const [categorias, productos] = await Promise.all([getCategorias(), getProductos()]);

  return (
    <>
      <section className="bg-teal-dark px-6 py-16 text-white">
        <div className="mx-auto max-w-[1350px]">
          <h1 className="text-white">Catálogo</h1>
          <p className="mt-2 max-w-xl text-white/80">
            Explora todo nuestro mobiliario y equipo disponible para renta.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1350px] gap-10 px-6 py-16 md:grid-cols-[220px_1fr]">
        <aside>
          <h2 className="mb-4 text-lg">Categorías</h2>
          <ul className="space-y-2">
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalogo/${c.slug}`} className="text-ink hover:text-teal">
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
