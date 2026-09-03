"use client";

import { CATALOGO_POR_TIPO, type ItemColocado } from "@/lib/floorplan-catalog";

function SillasAlrededor({ asientos, anchoM, largoM, forma, escala }: {
  asientos: number;
  anchoM: number;
  largoM: number;
  forma: "circulo" | "rectangulo";
  escala: number;
}) {
  if (asientos === 0) return null;
  const tamSilla = 0.35 * escala;
  const posiciones: { left: number; top: number }[] = [];

  if (forma === "circulo") {
    const radio = (anchoM / 2) * escala + tamSilla * 0.6;
    const centro = (anchoM / 2) * escala;
    for (let i = 0; i < asientos; i++) {
      const angulo = (i / asientos) * Math.PI * 2 - Math.PI / 2;
      posiciones.push({
        left: centro + radio * Math.cos(angulo) - tamSilla / 2,
        top: centro + radio * Math.sin(angulo) - tamSilla / 2,
      });
    }
  } else {
    const anchoPx = anchoM * escala;
    const largoPx = largoM * escala;
    const porLado = Math.max(1, Math.ceil(asientos / 2));
    const paso = anchoPx / (porLado + 1);
    for (let i = 0; i < asientos; i++) {
      const lado = i < porLado ? 0 : 1;
      const idx = i < porLado ? i : i - porLado;
      const left = paso * (idx + 1) - tamSilla / 2;
      const top = lado === 0 ? -tamSilla * 0.6 : largoPx - tamSilla * 0.4;
      posiciones.push({ left, top });
    }
  }

  return (
    <>
      {posiciones.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-sm bg-lime-dark/70"
          style={{ left: p.left, top: p.top, width: tamSilla, height: tamSilla }}
        />
      ))}
    </>
  );
}

export default function ItemNode({
  item,
  escala,
  seleccionado,
  onPointerDown,
}: {
  item: ItemColocado;
  escala: number;
  seleccionado: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  const def = CATALOGO_POR_TIPO[item.tipo];
  const anchoPx = def.anchoM * escala;
  const largoPx = def.largoM * escala;

  return (
    <div
      className="absolute touch-none select-none"
      style={{
        left: item.xM * escala - anchoPx / 2,
        top: item.yM * escala - largoPx / 2,
        width: anchoPx,
        height: largoPx,
        transform: `rotate(${item.rotacion}deg)`,
      }}
      onPointerDown={onPointerDown}
    >
      <SillasAlrededor asientos={def.asientos} anchoM={def.anchoM} largoM={def.largoM} forma={def.forma} escala={escala} />
      <div
        className={`flex h-full w-full items-center justify-center text-center text-[10px] font-semibold leading-tight text-white shadow-md ${
          seleccionado ? "ring-2 ring-lime ring-offset-1" : ""
        } ${def.forma === "circulo" ? "rounded-full" : "rounded-sm"}`}
        style={{ backgroundColor: def.color, cursor: "grab" }}
      >
        {def.etiqueta}
      </div>
    </div>
  );
}
