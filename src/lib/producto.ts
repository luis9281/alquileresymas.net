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
  const variante = producto.variantes[varianteIdx];
  if (variante?.nombre) return variante.nombre;
  return variante?.color ? `${producto.titulo} — ${variante.color}` : producto.titulo;
}

// Neutral colors go last in showcases: a strip of white and black tablecloths sells less.
const NEUTRO = /\b(blanc|negr|crema|marfil|beige|gris)/i;

/**
 * Picks up to `limite` cards for a home showcase, rotating across groups (subcategory + type,
 * or the product itself when it has none) so one 20-color product can't fill the strip.
 * Groups keep their order of first appearance in `productos`; inside each product, vivid
 * colors come before neutral ones. Returns one single-variant copy of the product per card,
 * in showcase order, which also keeps the page payload small.
 */
export function seleccionVitrina(productos: Producto[], limite: number): Producto[] {
  const grupos = new Map<string, { producto: Producto; variantes: number[] }[]>();
  for (const p of productos) {
    const variantes = p.variantes
      .map((v, i) => ({ i, neutro: NEUTRO.test(v.color ?? "") }))
      .sort((a, b) => Number(a.neutro) - Number(b.neutro))
      .map((v) => v.i);
    const clave = p.subcategoria ? `${p.subcategoria}/${p.tipo ?? ""}` : p._id;
    grupos.set(clave, [...(grupos.get(clave) ?? []), { producto: p, variantes }]);
  }

  const elegidos: Producto[] = [];
  const colas = [...grupos.values()].map((items) => ({ items, turno: 0 }));
  let quedan = limite;
  while (quedan > 0 && colas.some((c) => c.items.some((it) => it.variantes.length))) {
    for (const cola of colas) {
      if (quedan === 0) break;
      // Next product in this group that still has unshown variants, round-robin.
      for (let n = 0; n < cola.items.length; n++) {
        const item = cola.items[(cola.turno + n) % cola.items.length];
        if (!item.variantes.length) continue;
        elegidos.push({ ...item.producto, variantes: [item.producto.variantes[item.variantes.shift()!]] });
        cola.turno = (cola.turno + n + 1) % cola.items.length;
        quedan--;
        break;
      }
    }
  }

  return elegidos;
}
