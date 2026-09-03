"use client";

import { CATALOGO_POR_TIPO, type ItemColocado } from "@/lib/floorplan-catalog";
import ItemNode from "./ItemNode";

const MAX_ANCHO_PX = 820;
const MAX_ALTO_PX = 560;

export default function Canvas({
  anchoSalonM,
  largoSalonM,
  items,
  seleccionadoId,
  onSeleccionar,
  onMover,
}: {
  anchoSalonM: number;
  largoSalonM: number;
  items: ItemColocado[];
  seleccionadoId: string | null;
  onSeleccionar: (id: string | null) => void;
  onMover: (id: string, xM: number, yM: number) => void;
}) {
  const escala = Math.min(MAX_ANCHO_PX / anchoSalonM, MAX_ALTO_PX / largoSalonM);
  const anchoPx = anchoSalonM * escala;
  const altoPx = largoSalonM * escala;

  function handlePointerDown(e: React.PointerEvent, item: ItemColocado) {
    e.stopPropagation();
    onSeleccionar(item.id);
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startXM = item.xM;
    const startYM = item.yM;
    const def = CATALOGO_POR_TIPO[item.tipo];
    const halfW = def.anchoM / 2;
    const halfL = def.largoM / 2;

    function onPointerMove(ev: PointerEvent) {
      const dxM = (ev.clientX - startClientX) / escala;
      const dyM = (ev.clientY - startClientY) / escala;
      const nuevoX = Math.min(Math.max(startXM + dxM, halfW), anchoSalonM - halfW);
      const nuevoY = Math.min(Math.max(startYM + dyM, halfL), largoSalonM - halfL);
      onMover(item.id, nuevoX, nuevoY);
    }
    function onPointerUp() {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    }
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  return (
    <div className="overflow-auto rounded-md border border-border bg-cream/60 p-4">
      <div
        className="relative mx-auto bg-white shadow-inner"
        style={{
          width: anchoPx,
          height: altoPx,
          backgroundImage:
            "linear-gradient(#e3decf 1px, transparent 1px), linear-gradient(90deg, #e3decf 1px, transparent 1px)",
          backgroundSize: `${escala}px ${escala}px`,
        }}
        onPointerDown={() => onSeleccionar(null)}
      >
        {items.map((item) => (
          <ItemNode
            key={item.id}
            item={item}
            escala={escala}
            seleccionado={item.id === seleccionadoId}
            onPointerDown={(e) => handlePointerDown(e, item)}
          />
        ))}
      </div>
    </div>
  );
}
