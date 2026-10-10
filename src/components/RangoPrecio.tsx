"use client";

import { MONEDA } from "@/lib/precio";

/**
 * Dual-thumb price slider: two native range inputs stacked on one track
 * (keyboard and screen-reader friendly, no extra dependency). Thumb styling
 * lives in globals.css under `.rango-doble`.
 */
export default function RangoPrecio({
  min,
  max,
  valor,
  onChange,
}: {
  min: number;
  max: number;
  valor: [number, number];
  onChange: (valor: [number, number]) => void;
}) {
  const [desde, hasta] = valor;
  const porcentaje = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="w-full sm:w-64">
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="text-muted">Precio</span>
        <span className="font-semibold text-ink" aria-hidden="true">
          {MONEDA}{desde} – {MONEDA}{hasta}
        </span>
      </div>
      <div className="rango-doble relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-border" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-teal"
          style={{ left: `${porcentaje(desde)}%`, right: `${100 - porcentaje(hasta)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={desde}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hasta), hasta])}
          aria-label="Precio mínimo"
          aria-valuetext={`${MONEDA}${desde}`}
          // When both thumbs meet at the top end, keep the "desde" thumb grabbable.
          className={desde >= max - (max - min) * 0.05 ? "z-20" : "z-10"}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={hasta}
          onChange={(e) => onChange([desde, Math.max(Number(e.target.value), desde)])}
          aria-label="Precio máximo"
          aria-valuetext={`${MONEDA}${hasta}`}
          className="z-10"
        />
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>{MONEDA}{min}</span>
        <span>{MONEDA}{max}</span>
      </div>
    </div>
  );
}
