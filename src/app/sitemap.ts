import type { MetadataRoute } from "next";
import { getCategorias, getProductos, getPosts } from "@/lib/sanity/queries";
import { subcategoriasDe, urlSeleccion } from "@/lib/categorias";

const SITE_URL = "https://www.alquileresymas.net";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categorias, productos, posts] = await Promise.all([
    getCategorias(),
    getProductos(),
    getPosts(),
  ]);

  const estaticas: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/catalogo`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/planos-del-salon`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/diseno-de-eventos`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/nosotros`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/contacto`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/cotizacion`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/politica-de-privacidad`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categoriaUrls: MetadataRoute.Sitemap = categorias.map((c) => ({
    url: `${SITE_URL}/catalogo/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // /catalogo/manteleria?sub=servilletas has its own canonical (see the category page metadata).
  const subcategoriaUrls: MetadataRoute.Sitemap = categorias.flatMap((c) =>
    subcategoriasDe(productos.filter((p) => p.categoria.slug === c.slug)).flatMap((s) =>
      [undefined, ...s.tipos.map((t) => t.slug)].map((tipo) => ({
        url: `${SITE_URL}${urlSeleccion(c.slug, s.slug, tipo)}`,
        changeFrequency: "weekly" as const,
        priority: tipo ? 0.6 : 0.7,
      }))
    )
  );

  const productoUrls: MetadataRoute.Sitemap = productos.map((p) => ({
    url: `${SITE_URL}/catalogo/${p.categoria.slug}/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.fecha,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...estaticas, ...categoriaUrls, ...subcategoriaUrls, ...productoUrls, ...postUrls];
}
