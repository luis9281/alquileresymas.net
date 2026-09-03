import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import { getProducto, getProductos } from "@/lib/sanity/queries";
import { imagenPrincipal } from "@/lib/producto";

type Props = {
  params: Promise<{ categoria: string; producto: string }>;
  searchParams: Promise<{ color?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { producto: slug } = await params;
  const producto = await getProducto(slug);
  if (!producto) return { title: "Producto | Alquileres Eventos & Más" };

  const detalles = [producto.medidas, producto.capacidad].filter(Boolean).join(" · ");
  const descripcion =
    producto.descripcion ||
    `Renta de ${producto.titulo} para tu evento en Panamá${detalles ? ` (${detalles})` : ""}. Entrega, montaje y desmontaje incluidos.`;
  const imagen = imagenPrincipal(producto);

  return {
    title: `${producto.titulo} | ${producto.categoria.nombre} | Alquileres Eventos & Más`,
    description: descripcion,
    openGraph: imagen ? { images: [imagen] } : undefined,
  };
}

export default async function ProductoPage({ params, searchParams }: Props) {
  const { categoria: categoriaSlug, producto: slug } = await params;
  const { color } = await searchParams;
  const producto = await getProducto(slug);

  if (!producto || producto.categoria.slug !== categoriaSlug) notFound();

  const varianteInicial = color ? Math.max(0, producto.variantes.findIndex((v) => v.color === color)) : 0;
  const relacionados = (await getProductos(categoriaSlug)).filter((p) => p._id !== producto._id).slice(0, 4);

  return (
    <>
      <section className="mx-auto grid max-w-[1350px] gap-12 px-6 py-16 md:grid-cols-2">
        <ProductGallery producto={producto} varianteInicial={varianteInicial} />
      </section>

      {relacionados.length > 0 && (
        <section className="mx-auto max-w-[1350px] px-6 py-16">
          <h2 className="mb-8 text-2xl">También te puede interesar</h2>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {relacionados.map((p) => (
              <ProductCard key={p._id} producto={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
