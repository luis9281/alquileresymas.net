"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import type { Producto } from "@/lib/types";
import { aListados, tituloListado, type ProductoListado } from "@/lib/producto";

const OPCIONES_ORDEN = [
  { value: "nombre-asc", label: "Nombre: A-Z" },
  { value: "nombre-desc", label: "Nombre: Z-A" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
] as const;

type Orden = (typeof OPCIONES_ORDEN)[number]["value"];

function comparar(a: ProductoListado, b: ProductoListado, orden: Orden): number {
  if (orden === "nombre-asc" || orden === "nombre-desc") {
    const cmp = tituloListado(a).localeCompare(tituloListado(b), "es");
    return orden === "nombre-asc" ? cmp : -cmp;
  }
  const pa = a.producto.precio;
  const pb = b.producto.precio;
  if (pa == null && pb == null) return 0;
  if (pa == null) return 1;
  if (pb == null) return -1;
  return orden === "precio-asc" ? pa - pb : pb - pa;
}

export default function CatalogGrid({ productos }: { productos: Producto[] }) {
  const [orden, setOrden] = useState<Orden>("nombre-asc");
  const listados = useMemo(() => aListados(productos), [productos]);
  const ordenados = useMemo(
    () => [...listados].sort((a, b) => comparar(a, b, orden)),
    [listados, orden]
  );

  if (listados.length === 0) {
    return <p className="text-muted">Pronto agregaremos productos a esta categoría.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-end gap-2">
        <label htmlFor="orden-catalogo" className="text-sm text-muted">
          Ordenar por
        </label>
        <select
          id="orden-catalogo"
          value={orden}
          onChange={(e) => setOrden(e.target.value as Orden)}
          className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
        >
          {OPCIONES_ORDEN.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {ordenados.map(({ producto, varianteIdx }) => (
          <ProductCard key={`${producto._id}-${varianteIdx}`} producto={producto} varianteIdx={varianteIdx} />
        ))}
      </div>
    </div>
  );
}
