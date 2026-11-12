import type { Categoria, Producto } from "./types";

/**
 * A-Z by name, for navigation lists (catalog sidebar, header menu).
 * The home grid keeps the "orden" field from Sanity instead.
 */
export function ordenarAlfabeticamente(categorias: Categoria[]): Categoria[] {
  return [...categorias].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export type Tipo = { slug: string; nombre: string; cantidad: number };
/** Optional level between subcategory and type (Redondos > 60" > Corrugado), with its own types. */
export type Grupo = Tipo & { tipos: Tipo[] };
/**
 * `tipos`: every type in the subcategory, whatever its group (keeps old ?sub=&tipo= links working).
 * `grupos`: present when some product sets a group; the sidebar then lists groups instead of `tipos`.
 * All lists A-Z; empty when no product sets that level.
 */
export type Subcategoria = Tipo & { tipos: Tipo[]; grupos: Grupo[] };

/** Adds one product's cards to the matching entry of `lista` (by slug), creating it if needed. */
function sumar<T extends Tipo>(lista: T[], nombre: string, tarjetas: number, nuevo: (t: Tipo) => T): T {
  const slug = slugSubcategoria(nombre);
  let item = lista.find((t) => t.slug === slug);
  if (item) item.cantidad += tarjetas;
  else lista.push((item = nuevo({ slug, nombre, cantidad: tarjetas })));
  return item;
}

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
  const subs: Subcategoria[] = [];
  for (const p of productos) {
    if (!p.subcategoria) continue;
    const tarjetas = Math.max(1, p.variantes.length);
    const sub = sumar(subs, p.subcategoria, tarjetas, (t) => ({ ...t, tipos: [], grupos: [] }));
    if (p.tipo) sumar(sub.tipos, p.tipo, tarjetas, (t) => t);
    if (!p.grupo) continue;
    const grupo = sumar(sub.grupos, p.grupo, tarjetas, (t) => ({ ...t, tipos: [] }));
    if (p.tipo) sumar(grupo.tipos, p.tipo, tarjetas, (t) => t);
  }
  const az = (a: Tipo, b: Tipo) => a.nombre.localeCompare(b.nombre, "es", { numeric: true });
  return subs
    .map((s) => ({
      ...s,
      tipos: s.tipos.sort(az),
      grupos: s.grupos.map((g) => ({ ...g, tipos: g.tipos.sort(az) })).sort(az),
    }))
    .sort(az);
}

const coincide = (valor: string | undefined, slug?: string) => !slug || (valor && slugSubcategoria(valor) === slug);

/** Products of `?sub=` (and `?grupo=` / `?tipo=` inside it), given slugs already validated by subcategoriasDe. */
export function productosDe(productos: Producto[], sub: string, tipo?: string, grupo?: string): Producto[] {
  return productos.filter((p) => coincide(p.subcategoria, sub) && coincide(p.grupo, grupo) && coincide(p.tipo, tipo));
}

/** /catalogo/manteleria?sub=redondos&grupo=60&tipo=corrugado (each level optional). */
export function urlSeleccion(categoria: string, sub?: string, tipo?: string, grupo?: string): string {
  if (!sub) return `/catalogo/${categoria}`;
  return `/catalogo/${categoria}?sub=${sub}${grupo ? `&grupo=${grupo}` : ""}${tipo ? `&tipo=${tipo}` : ""}`;
}
