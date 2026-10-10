import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import JsonLd from "@/components/JsonLd";
import { getProducto, getProductos } from "@/lib/sanity/queries";
import { imagenPrincipal } from "@/lib/producto";
import { formatoPrecio } from "@/lib/precio";
import type { Producto } from "@/lib/types";

const SITE_URL = "https://www.alquileresymas.net";

type Props = {
  params: Promise<{ categoria: string; producto: string }>;
  searchParams: Promise<{ color?: string }>;
};

/** "en 15 colores (Amarilla, Azul navy, Azul rey y 12 más)" - empty for single-color products. */
function resumenColores(producto: Producto): string {
  const colores = producto.variantes.map((v) => v.color).filter((c): c is string => Boolean(c));
  if (colores.length < 2) return "";
  const muestra = colores.slice(0, 3).join(", ");
  const resto = colores.length - 3;
  return ` en ${colores.length} colores (${muestra}${resto > 0 ? ` y ${resto} más` : ""})`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria: categoriaSlug, producto: slug } = await params;
  const producto = await getProducto(slug);
  if (!producto) return { title: "Producto | Alquileres Eventos & Más" };

  const detalles = [producto.medidas, producto.capacidad].filter(Boolean).join(" · ");
  const descripcion =
    producto.descripcion ||
    // Price and colors are what people scan for in search results.
    `Renta de ${producto.titulo} para tu evento en Panamá${resumenColores(producto)}${detalles ? ` (${detalles})` : ""}.${
      typeof producto.precio === "number" ? ` Desde ${formatoPrecio(producto.precio)}.` : ""
    } Entrega, montaje y desmontaje incluidos.`;
  const imagen = imagenPrincipal(producto);

  return {
    title: `${producto.titulo} | ${producto.categoria.nombre} | Alquileres Eventos & Más`,
    description: descripcion,
    alternates: { canonical: `/catalogo/${categoriaSlug}/${slug}` },
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

  const imagenes = producto.variantes.flatMap((v) => v.imagenes);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.titulo,
    description:
      producto.descripcion || `Renta de ${producto.titulo} para eventos en Panamá.`,
    image: imagenes.length ? imagenes : undefined,
    category: producto.categoria.nombre,
    url: `${SITE_URL}/catalogo/${categoriaSlug}/${slug}`,
    ...(producto.precio
      ? {
          offers: {
            "@type": "Offer",
            price: producto.precio,
            priceCurrency: "PAB",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/catalogo/${categoriaSlug}/${slug}`,
          },
        }
      : {}),
  };

  // Catálogo › Categoría › Producto, shown by Google instead of the raw URL.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Catálogo", item: `${SITE_URL}/catalogo` },
      { "@type": "ListItem", position: 2, name: producto.categoria.nombre, item: `${SITE_URL}/catalogo/${categoriaSlug}` },
      { "@type": "ListItem", position: 3, name: producto.titulo, item: `${SITE_URL}/catalogo/${categoriaSlug}/${slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
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
