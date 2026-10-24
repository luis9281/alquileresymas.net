import type { Producto } from "./types";

/** Balboa symbol, as used in the client's Booqable shop ("B/.50.00"). */
export const MONEDA = "B/.";

/** Product price for display: B/.50.00 */
export function formatoPrecio(precio: number): string {
  return `${MONEDA}${precio.toFixed(2)}`;
}

/** Price of one color variant: its own price if set, else the product's. */
export function precioDeVariante(producto: Producto, varianteIdx: number): number | undefined {
  return producto.variantes[varianteIdx]?.precio ?? producto.precio;
}
