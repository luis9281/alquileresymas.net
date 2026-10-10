"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import RangoPrecio from "./RangoPrecio";
import BuscadorProductos, { MIN_CARACTERES_BUSQUEDA, normalizar } from "./BuscadorProductos";
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

export default function CatalogGrid({
  productos,
  filtroPrecio = false,
}: {
  productos: Producto[];
  /** Show the price range slider (only used inside a single category). */
  filtroPrecio?: boolean;
}) {
  const [orden, setOrden] = useState<Orden>("nombre-asc");
  const [busqueda, setBusqueda] = useState("");
  // null = whole range, i.e. no price filter.
  const [rango, setRango] = useState<[number, number] | null>(null);
  const listados = useMemo(() => aListados(productos), [productos]);
  const nombres = useMemo(() => listados.map(tituloListado), [listados]);

  // Whole-dollar bounds so the slider's step=1 can reach both ends.
  const limites = useMemo(() => {
    const precios = productos.map((p) => p.precio).filter((p): p is number => typeof p === "number");
    if (!precios.length) return null;
    const min = Math.floor(Math.min(...precios));
    const max = Math.ceil(Math.max(...precios));
    return min < max ? { min, max } : null;
  }, [productos]);
  const mostrarFiltroPrecio = filtroPrecio && limites !== null;

  const consulta = normalizar(busqueda.trim());
  const buscando = consulta.length >= MIN_CARACTERES_BUSQUEDA;
  const filtrandoPrecio = mostrarFiltroPrecio && rango !== null;
  const filtrando = buscando || filtrandoPrecio;

  const ordenados = useMemo(() => {
    const filtrados = listados.filter((l) => {
      if (buscando && !normalizar(tituloListado(l)).includes(consulta)) return false;
      if (filtrandoPrecio) {
        // Products without a price are "a cotizar": hidden only while a range is set.
        const precio = l.producto.precio;
        if (typeof precio !== "number" || precio < rango[0] || precio > rango[1]) return false;
      }
      return true;
    });
    return filtrados.sort((a, b) => comparar(a, b, orden));
  }, [listados, orden, buscando, consulta, filtrandoPrecio, rango]);

  if (listados.length === 0) {
    return <p className="text-muted">Pronto agregaremos productos a esta categoría.</p>;
  }

  const cambiarRango = (nuevo: [number, number]) =>
    setRango(limites && nuevo[0] === limites.min && nuevo[1] === limites.max ? null : nuevo);

  const limpiarFiltros = () => {
    setBusqueda("");
    setRango(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <BuscadorProductos valor={busqueda} onChange={setBusqueda} nombres={nombres} />

        {mostrarFiltroPrecio && (
          <RangoPrecio
            min={limites.min}
            max={limites.max}
            valor={rango ?? [limites.min, limites.max]}
            onChange={cambiarRango}
          />
        )}

        <div>
          <label htmlFor="orden-catalogo" className="mb-1 block text-sm text-muted">
            Ordenar por
          </label>
          <select
            id="orden-catalogo"
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink sm:w-auto"
          >
            {OPCIONES_ORDEN.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtrando && (
        <p className="mb-4 text-sm text-muted" aria-live="polite">
          {ordenados.length === 0
            ? "Ningún producto coincide con tu búsqueda."
            : `${ordenados.length} de ${listados.length} productos.`}{" "}
          <button type="button" onClick={limpiarFiltros} className="font-medium text-teal hover:underline">
            Limpiar filtros
          </button>
        </p>
      )}

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {ordenados.map(({ producto, varianteIdx }) => (
          <ProductCard key={`${producto._id}-${varianteIdx}`} producto={producto} varianteIdx={varianteIdx} />
        ))}
      </div>
    </div>
  );
}
