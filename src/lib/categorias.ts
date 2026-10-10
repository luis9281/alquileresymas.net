import type { Categoria } from "./types";

/**
 * A-Z by name, for navigation lists (catalog sidebar, header menu).
 * The home grid keeps the "orden" field from Sanity instead.
 */
export function ordenarAlfabeticamente(categorias: Categoria[]): Categoria[] {
  return [...categorias].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
