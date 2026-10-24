"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import RangoPrecio from "./RangoPrecio";
import BuscadorProductos, { MIN_CARACTERES_BUSQUEDA, normalizar } from "./BuscadorProductos";
import type { Producto } from "@/lib/types";
import { aListados, tituloListado, type ProductoListado } from "@/lib/producto";
import { familiaDeColor, ORDEN_FAMILIAS, type FamiliaColor } from "@/lib/colores";
import { precioDeVariante } from "@/lib/precio";

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
  const pa = precioDe(a);
  const pb = precioDe(b);
  if (pa == null && pb == null) return 0;
  if (pa == null) return 1;
  if (pb == null) return -1;
  return orden === "precio-asc" ? pa - pb : pb - pa;
}

const precioDe = ({ producto, varianteIdx }: ProductoListado) => precioDeVariante(producto, varianteIdx);

const familiaDe = ({ producto, varianteIdx }: ProductoListado) =>
  familiaDeColor(producto.variantes[varianteIdx]?.color);

export default function CatalogGrid({
  productos,
  filtroPrecio = false,
  filtroColor = false,
}: {
  productos: Producto[];
  /** Show the price range slider (only used inside a single category). */
  filtroPrecio?: boolean;
  /** Show the color-family chips (only used inside a single category). */
  filtroColor?: boolean;
}) {
  const [orden, setOrden] = useState<Orden>("nombre-asc");
  const [busqueda, setBusqueda] = useState("");
  // null = whole range, i.e. no price filter.
  const [rango, setRango] = useState<[number, number] | null>(null);
  const [colores, setColores] = useState<string[]>([]);
  const listados = useMemo(() => aListados(productos), [productos]);
  const nombres = useMemo(() => listados.map(tituloListado), [listados]);

  // Whole-dollar bounds so the slider's step=1 can reach both ends.
  const limites = useMemo(() => {
    const precios = listados.map(precioDe).filter((p): p is number => typeof p === "number");
    if (!precios.length) return null;
    const min = Math.floor(Math.min(...precios));
    const max = Math.ceil(Math.max(...precios));
    return min < max ? { min, max } : null;
  }, [listados]);
  const mostrarFiltroPrecio = filtroPrecio && limites !== null;

  // Color families present in this category, with listing counts.
  const familias = useMemo(() => {
    const cuenta = new Map<string, { familia: FamiliaColor; cantidad: number }>();
    for (const l of listados) {
      const f = familiaDe(l);
      if (!f) continue;
      const actual = cuenta.get(f.nombre);
      if (actual) actual.cantidad++;
      else cuenta.set(f.nombre, { familia: f, cantidad: 1 });
    }
    return [...cuenta.values()].sort(
      (a, b) => ORDEN_FAMILIAS.indexOf(a.familia.nombre) - ORDEN_FAMILIAS.indexOf(b.familia.nombre),
    );
  }, [listados]);
  const mostrarFiltroColor = filtroColor && familias.length >= 2;

  const consulta = normalizar(busqueda.trim());
  const buscando = consulta.length >= MIN_CARACTERES_BUSQUEDA;
  const filtrandoPrecio = mostrarFiltroPrecio && rango !== null;
  const filtrandoColor = mostrarFiltroColor && colores.length > 0;
  const filtrando = buscando || filtrandoPrecio || filtrandoColor;

  const ordenados = useMemo(() => {
    const filtrados = listados.filter((l) => {
      if (buscando && !normalizar(tituloListado(l)).includes(consulta)) return false;
      if (filtrandoPrecio) {
        // Products without a price are "a cotizar": hidden only while a range is set.
        const precio = precioDe(l);
        if (typeof precio !== "number" || precio < rango[0] || precio > rango[1]) return false;
      }
      if (filtrandoColor && !colores.includes(familiaDe(l)?.nombre ?? "")) return false;
      return true;
    });
    return filtrados.sort((a, b) => comparar(a, b, orden));
  }, [listados, orden, buscando, consulta, filtrandoPrecio, rango, filtrandoColor, colores]);

  if (listados.length === 0) {
    return <p className="text-muted">Pronto agregaremos productos a esta categoría.</p>;
  }

  const cambiarRango = (nuevo: [number, number]) =>
    setRango(limites && nuevo[0] === limites.min && nuevo[1] === limites.max ? null : nuevo);

  const limpiarFiltros = () => {
    setBusqueda("");
    setRango(null);
    setColores([]);
  };

  const alternarColor = (nombre: string) =>
    setColores((actuales) =>
      actuales.includes(nombre) ? actuales.filter((c) => c !== nombre) : [...actuales, nombre],
    );

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

      {mostrarFiltroColor && (
        <fieldset className="mb-6">
          <legend className="mb-2 text-sm text-muted">Color</legend>
          <div className="flex flex-wrap gap-2">
            {familias.map(({ familia, cantidad }) => {
              const activo = colores.includes(familia.nombre);
              return (
                <button
                  key={familia.nombre}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => alternarColor(familia.nombre)}
                  className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-sm transition-colors ${
                    activo
                      ? "border-teal bg-teal/10 font-semibold text-teal-dark"
                      : "border-border bg-white text-ink hover:border-teal"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 rounded-full border border-black/15"
                    style={{ background: familia.muestra }}
                  />
                  {familia.nombre}
                  <span className="text-xs text-muted">{cantidad}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

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
