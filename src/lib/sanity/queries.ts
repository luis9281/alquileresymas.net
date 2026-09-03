import { sanityClient, urlFor } from "./client";
import { categoriasMuestra, productosMuestra, postsMuestra } from "../sample-data";
import type { Categoria, Producto, Post } from "../types";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url";

/**
 * Every getter here tries Sanity first and falls back to the bundled
 * sample data (categoriasMuestra/productosMuestra/postsMuestra) when no
 * Sanity project is configured yet, or the query comes back empty. This
 * keeps every page renderable from day one, before real content exists.
 */

type SanityVariante = {
  color?: string;
  imagenes?: SanityImageSource[];
};

type SanityProducto = {
  _id: string;
  titulo: string;
  slug: { current: string };
  categoria: { titulo: string; slug: { current: string } } | null;
  variantes?: SanityVariante[];
  medidas?: string;
  capacidad?: string;
  descripcion?: string;
  precio?: number;
};

type SanityPost = {
  _id: string;
  titulo: string;
  slug: { current: string };
  extracto?: string;
  imagen?: unknown;
  fecha: string;
  contenido?: PortableTextBlock[];
};

function mapProducto(p: SanityProducto): Producto {
  const variantes = (p.variantes ?? []).map((v) => ({
    color: v.color,
    imagenes: (v.imagenes ?? [])
      .map((img) => urlFor(img)?.width(1000).height(1000).fit("crop").url())
      .filter((url): url is string => Boolean(url)),
  }));
  return {
    _id: p._id,
    titulo: p.titulo,
    slug: p.slug.current,
    categoria: {
      slug: p.categoria?.slug.current ?? "sin-categoria",
      nombre: p.categoria?.titulo ?? "Sin categoria",
    },
    variantes,
    medidas: p.medidas,
    capacidad: p.capacidad,
    descripcion: p.descripcion,
    precio: p.precio,
  };
}

function mapPost(p: SanityPost): Post {
  const img = p.imagen ? urlFor(p.imagen)?.width(1200).height(750).fit("crop").url() : undefined;
  return {
    _id: p._id,
    titulo: p.titulo,
    slug: p.slug.current,
    extracto: p.extracto,
    imagen: img,
    fecha: p.fecha,
    contenido: p.contenido,
  };
}

type SanityCategoria = {
  nombre: string;
  slug: string;
  imagen?: SanityImageSource;
};

export async function getCategorias(): Promise<Categoria[]> {
  if (!sanityClient) return categoriasMuestra;
  try {
    const data: SanityCategoria[] = await sanityClient.fetch(
      `*[_type == "categoriaProducto"] | order(orden asc, titulo asc){ "nombre": titulo, "slug": slug.current, imagen }`
    );
    if (!data?.length) return categoriasMuestra;
    return data.map((c) => ({
      nombre: c.nombre,
      slug: c.slug,
      imagen: c.imagen ? urlFor(c.imagen)?.width(600).height(800).fit("crop").url() : undefined,
    }));
  } catch {
    return categoriasMuestra;
  }
}

export async function getProductos(categoriaSlug?: string): Promise<Producto[]> {
  if (!sanityClient) {
    return categoriaSlug
      ? productosMuestra.filter((p) => p.categoria.slug === categoriaSlug)
      : productosMuestra;
  }
  try {
    const filtro = categoriaSlug ? `&& categoria->slug.current == $categoriaSlug` : "";
    const data: SanityProducto[] = await sanityClient.fetch(
      `*[_type == "producto" ${filtro}] | order(titulo asc){
        _id, titulo, slug, variantes, medidas, capacidad, descripcion, precio,
        "categoria": categoria->{ titulo, slug }
      }`,
      { categoriaSlug }
    );
    if (!data?.length) {
      return categoriaSlug
        ? productosMuestra.filter((p) => p.categoria.slug === categoriaSlug)
        : productosMuestra;
    }
    return data.map(mapProducto);
  } catch {
    return categoriaSlug
      ? productosMuestra.filter((p) => p.categoria.slug === categoriaSlug)
      : productosMuestra;
  }
}

export async function getProducto(slug: string): Promise<Producto | null> {
  if (!sanityClient) {
    return productosMuestra.find((p) => p.slug === slug) ?? null;
  }
  try {
    const data: SanityProducto | null = await sanityClient.fetch(
      `*[_type == "producto" && slug.current == $slug][0]{
        _id, titulo, slug, variantes, medidas, capacidad, descripcion, precio,
        "categoria": categoria->{ titulo, slug }
      }`,
      { slug }
    );
    return data ? mapProducto(data) : productosMuestra.find((p) => p.slug === slug) ?? null;
  } catch {
    return productosMuestra.find((p) => p.slug === slug) ?? null;
  }
}

export async function getPosts(): Promise<Post[]> {
  if (!sanityClient) return postsMuestra;
  try {
    const data: SanityPost[] = await sanityClient.fetch(
      `*[_type == "post"] | order(fecha desc){ _id, titulo, slug, extracto, imagen, fecha }`
    );
    return data?.length ? data.map(mapPost) : postsMuestra;
  } catch {
    return postsMuestra;
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  if (!sanityClient) return postsMuestra.find((p) => p.slug === slug) ?? null;
  try {
    const data: SanityPost | null = await sanityClient.fetch(
      `*[_type == "post" && slug.current == $slug][0]{
        _id, titulo, slug, extracto, imagen, fecha, contenido
      }`,
      { slug }
    );
    return data ? mapPost(data) : postsMuestra.find((p) => p.slug === slug) ?? null;
  } catch {
    return postsMuestra.find((p) => p.slug === slug) ?? null;
  }
}
