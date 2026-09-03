"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Producto } from "@/lib/types";
import QuoteButton from "./QuoteButton";

export default function ProductGallery({
  producto,
  varianteInicial = 0,
}: {
  producto: Producto;
  varianteInicial?: number;
}) {
  const [varianteIdx, setVarianteIdx] = useState(varianteInicial);
  const [imagenIdx, setImagenIdx] = useState(0);

  const variante = producto.variantes[varianteIdx] ?? producto.variantes[0];
  const imagenes = variante?.imagenes ?? [];
  const imagenActiva = imagenes[imagenIdx] ?? imagenes[0];
  const hayColores = producto.variantes.length > 1;

  function elegirVariante(idx: number) {
    setVarianteIdx(idx);
    setImagenIdx(0);
  }

  return (
    <>
      <div>
        <div className="aspect-square overflow-hidden rounded-md bg-border">
          {imagenActiva ? (
            <Image
              src={imagenActiva}
              alt={variante?.color ? `${producto.titulo} - ${variante.color}` : producto.titulo}
              width={900}
              height={900}
              className="h-full w-full object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-teal/20 to-lime/20" />
          )}
        </div>

        {imagenes.length > 1 && (
          <div className="mt-3 flex gap-2">
            {imagenes.map((img, idx) => (
              <button
                key={img}
                type="button"
                onClick={() => setImagenIdx(idx)}
                className={`h-16 w-16 overflow-hidden rounded border-2 ${
                  idx === imagenIdx ? "border-teal" : "border-transparent"
                }`}
              >
                <Image src={img} alt="" width={64} height={64} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <Link
          href={`/catalogo/${producto.categoria.slug}`}
          className="text-xs font-semibold uppercase tracking-wide text-teal"
        >
          {producto.categoria.nombre}
        </Link>
        <h1 className="mt-2">{producto.titulo}</h1>

        {(producto.medidas || producto.capacidad) && (
          <ul className="mt-4 space-y-1 text-muted">
            {producto.medidas && <li><strong className="text-ink">Medidas:</strong> {producto.medidas}</li>}
            {producto.capacidad && <li><strong className="text-ink">Capacidad:</strong> {producto.capacidad}</li>}
          </ul>
        )}

        {producto.descripcion && <p className="mt-5 text-ink/90">{producto.descripcion}</p>}

        {hayColores && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-ink">Color / acabado</p>
            <div className="flex flex-wrap gap-2">
              {producto.variantes.map((v, idx) => (
                <button
                  key={v.color ?? idx}
                  type="button"
                  onClick={() => elegirVariante(idx)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
                    idx === varianteIdx
                      ? "border-teal bg-teal text-white"
                      : "border-border text-ink hover:border-teal"
                  }`}
                >
                  {v.color || "Unico"}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <QuoteButton
            producto={producto}
            colorSeleccionado={hayColores ? variante?.color : undefined}
            imagenSeleccionada={imagenActiva}
            className="rounded-md bg-lime px-6 py-3 font-semibold text-teal-dark hover:bg-lime-dark"
          />
        </div>
      </div>
    </>
  );
}
