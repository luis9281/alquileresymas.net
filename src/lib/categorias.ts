import type { Categoria, Producto } from "./types";

/**
 * A-Z by name, for navigation lists (catalog sidebar, header menu).
 * The home grid keeps the "orden" field from Sanity instead.
 */
export function ordenarAlfabeticamente(categorias: Categoria[]): Categoria[] {
  return [...categorias].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export type Tipo = { slug: string; nombre: string; cantidad: number };
/** `tipos`: optional third level (Redondos > Corrugado), A-Z; empty when no product sets one. */
export type Subcategoria = Tipo & { tipos: Tipo[] };

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
    let sub = porSlug.get(slug);
    if (sub) sub.cantidad += tarjetas;
    else porSlug.set(slug, (sub = { slug, nombre: p.subcategoria, cantidad: tarjetas, tipos: [] }));
    if (!p.tipo) continue;
    const tipoSlug = slugSubcategoria(p.tipo);
    const tipo = sub.tipos.find((t) => t.slug === tipoSlug);
    if (tipo) tipo.cantidad += tarjetas;
    else sub.tipos.push({ slug: tipoSlug, nombre: p.tipo, cantidad: tarjetas });
  }
  const az = (a: Tipo, b: Tipo) => a.nombre.localeCompare(b.nombre, "es");
  return [...porSlug.values()].map((s) => ({ ...s, tipos: s.tipos.sort(az) })).sort(az);
}

/** Products of `?sub=` (and `?tipo=` inside it), given slugs already validated by subcategoriasDe. */
export function productosDe(productos: Producto[], sub: string, tipo?: string): Producto[] {
  return productos.filter(
    (p) =>
      p.subcategoria &&
      slugSubcategoria(p.subcategoria) === sub &&
      (!tipo || (p.tipo && slugSubcategoria(p.tipo) === tipo))
  );
}

/** /catalogo/manteleria?sub=redondos&tipo=corrugado (each level optional). */
export function urlSeleccion(categoria: string, sub?: string, tipo?: string): string {
  if (!sub) return `/catalogo/${categoria}`;
  return `/catalogo/${categoria}?sub=${sub}${tipo ? `&tipo=${tipo}` : ""}`;
}
