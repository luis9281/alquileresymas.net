import type { Categoria, Producto } from "./types";

/**
 * A-Z by name, for navigation lists (catalog sidebar, header menu).
 * The home grid keeps the "orden" field from Sanity instead.
 */
export function ordenarAlfabeticamente(categorias: Categoria[]): Categoria[] {
  return [...categorias].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export type Subcategoria = { slug: string; nombre: string; cantidad: number };

/** "Porta platos" -> "porta-platos" (used in ?sub= links). */
export function slugSubcategoria(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Distinct subcategories of a category's products, A-Z. `cantidad` counts
 * catalog cards (one per color variant), matching what the grid shows.
 */
export function subcategoriasDe(productos: Producto[]): Subcategoria[] {
  const porSlug = new Map<string, Subcategoria>();
  for (const p of productos) {
    if (!p.subcategoria) continue;
    const slug = slugSubcategoria(p.subcategoria);
    const tarjetas = Math.max(1, p.variantes.length);
    const actual = porSlug.get(slug);
    if (actual) actual.cantidad += tarjetas;
    else porSlug.set(slug, { slug, nombre: p.subcategoria, cantidad: tarjetas });
  }
  return [...porSlug.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
