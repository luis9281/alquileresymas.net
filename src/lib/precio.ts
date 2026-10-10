/** Balboa symbol, as used in the client's Booqable shop ("B/.50.00"). */
export const MONEDA = "B/.";

/** Product price for display: B/.50.00 */
export function formatoPrecio(precio: number): string {
  return `${MONEDA}${precio.toFixed(2)}`;
}
