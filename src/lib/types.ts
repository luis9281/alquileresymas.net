import type { PortableTextBlock } from "@portabletext/types";

export type Categoria = {
  slug: string;
  nombre: string;
  imagen?: string;
};

export type ProductoVariante = {
  color?: string;
  imagenes: string[];
};

export type Producto = {
  _id: string;
  titulo: string;
  slug: string;
  categoria: Categoria;
  variantes: ProductoVariante[];
  medidas?: string;
  capacidad?: string;
  descripcion?: string;
  precio?: number;
};

export type Post = {
  _id: string;
  titulo: string;
  slug: string;
  extracto?: string;
  imagen?: string;
  fecha: string;
  /** Sanity Portable Text blocks, rendered with @portabletext/react. Empty for sample posts. */
  contenido?: PortableTextBlock[];
};

export type QuoteItem = {
  id: string;
  title: string;
  image?: string;
  url: string;
  qty: number;
};
