import type { MetadataRoute } from "next";
import { getCategorias, getProductos, getPosts } from "@/lib/sanity/queries";

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
  ];

  const categoriaUrls: MetadataRoute.Sitemap = categorias.map((c) => ({
    url: `${SITE_URL}/catalogo/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

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

  return [...estaticas, ...categoriaUrls, ...productoUrls, ...postUrls];
}
