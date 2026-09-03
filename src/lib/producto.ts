import type { Producto } from "./types";

/** First photo of the first variant — used as the representative thumbnail. */
export function imagenPrincipal(producto: Producto): string | undefined {
  return producto.variantes[0]?.imagenes[0];
}

export type ProductoListado = {
  producto: Producto;
  varianteIdx: number;
};

/** Flattens each product's color variants into its own listing entry — no grouping. */
export function aListados(productos: Producto[]): ProductoListado[] {
  return productos.flatMap((producto) =>
    producto.variantes.map((_, varianteIdx) => ({ producto, varianteIdx }))
  );
}

export function tituloListado({ producto, varianteIdx }: ProductoListado): string {
  const color = producto.variantes[varianteIdx]?.color;
  return color ? `${producto.titulo} — ${color}` : producto.titulo;
}
