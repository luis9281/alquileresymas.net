"use client";

import { useMemo, useState } from "react";
import {
  CATALOGO_ITEMS,
  CATALOGO_POR_TIPO,
  AREA_POR_INVITADO,
  type ItemColocado,
  type TipoItem,
  type CategoriaItem,
} from "@/lib/floorplan-catalog";
import { CONTACTO } from "@/lib/site-info";
import Canvas from "./Canvas";

const CATEGORIAS: { id: CategoriaItem; titulo: string }[] = [
  { id: "mesas", titulo: "Mesas" },
  { id: "sillas", titulo: "Sillas" },
  { id: "espacios", titulo: "Espacios" },
];

function nuevoId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function FloorPlanner() {
  const [anchoSalonM, setAnchoSalonM] = useState(15);
  const [largoSalonM, setLargoSalonM] = useState(10);
  const [invitados, setInvitados] = useState(80);
  const [estilo, setEstilo] = useState<"banquete" | "coctel">("banquete");
  const [items, setItems] = useState<ItemColocado[]>([]);
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);
  const [mesaAuto, setMesaAuto] = useState<TipoItem>("mesa-redonda-8");

  const areaSalon = anchoSalonM * largoSalonM;
  const areaRecomendada = invitados * AREA_POR_INVITADO[estilo];
  const espacioSuficiente = areaSalon >= areaRecomendada;
  const espacioAjustado = !espacioSuficiente && areaSalon >= areaRecomendada * 0.85;

  const asientosColocados = useMemo(
    () => items.reduce((sum, i) => sum + CATALOGO_POR_TIPO[i.tipo].asientos, 0),
    [items]
  );
  const faltanAsientos = Math.max(0, invitados - asientosColocados);

  const conteoPorTipo = useMemo(() => {
    const conteo = new Map<TipoItem, number>();
    for (const item of items) conteo.set(item.tipo, (conteo.get(item.tipo) ?? 0) + 1);
    return conteo;
  }, [items]);

  // Rejilla compartida: cada elemento nuevo (manual o autocompletado) toma
  // la siguiente celda libre segun el total de elementos ya puestos, sin
  // importar el tipo, para que nunca se apilen ni se pisen entre si.
  function posicionEnRejilla(indice: number, anchoItemM: number, largoItemM: number) {
    const columnas = Math.max(2, Math.floor(anchoSalonM / 3));
    const col = indice % columnas;
    const fila = Math.floor(indice / columnas);
    return {
      xM: Math.min(anchoSalonM - anchoItemM / 2, 1.5 + col * 3),
      yM: Math.min(largoSalonM - largoItemM / 2, 1.5 + fila * 2.5),
    };
  }

  function agregarItem(tipo: TipoItem) {
    const def = CATALOGO_POR_TIPO[tipo];
    const { xM, yM } = posicionEnRejilla(items.length, def.anchoM, def.largoM);
    setItems((prev) => [...prev, { id: nuevoId(), tipo, xM, yM, rotacion: 0 }]);
  }

  function moverItem(id: string, xM: number, yM: number) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, xM, yM } : i)));
  }

  function rotarSeleccionado() {
    if (!seleccionadoId) return;
    setItems((prev) =>
      prev.map((i) => (i.id === seleccionadoId ? { ...i, rotacion: (i.rotacion + 90) % 360 } : i))
    );
  }

  function duplicarSeleccionado() {
    if (!seleccionadoId) return;
    const item = items.find((i) => i.id === seleccionadoId);
    if (!item) return;
    const def = CATALOGO_POR_TIPO[item.tipo];
    setItems((prev) => [
      ...prev,
      {
        ...item,
        id: nuevoId(),
        xM: Math.min(anchoSalonM - def.anchoM / 2, item.xM + 0.5),
        yM: Math.min(largoSalonM - def.largoM / 2, item.yM + 0.5),
      },
    ]);
  }

  function eliminarSeleccionado() {
    if (!seleccionadoId) return;
    setItems((prev) => prev.filter((i) => i.id !== seleccionadoId));
    setSeleccionadoId(null);
  }

  function limpiarTodo() {
    setItems([]);
    setSeleccionadoId(null);
  }

  function autocompletarMesas() {
    const def = CATALOGO_POR_TIPO[mesaAuto];
    if (faltanAsientos === 0 || def.asientos === 0) return;
    const numMesas = Math.ceil(faltanAsientos / def.asientos);
    const nuevos: ItemColocado[] = [];
    for (let i = 0; i < numMesas; i++) {
      const { xM, yM } = posicionEnRejilla(items.length + i, def.anchoM, def.largoM);
      nuevos.push({ id: nuevoId(), tipo: mesaAuto, xM, yM, rotacion: 0 });
    }
    setItems((prev) => [...prev, ...nuevos]);
  }

  function enviarPorWhatsApp() {
    const lineas = [
      "Hola, arme este plano de salón y quiero cotizar:",
      "",
      `*Salón:* ${anchoSalonM}m x ${largoSalonM}m (${areaSalon.toFixed(0)} m²)`,
      `*Invitados:* ${invitados}`,
      `*Asientos en el plano:* ${asientosColocados}`,
      "",
      "*Elementos:*",
      ...Array.from(conteoPorTipo.entries()).map(
        ([tipo, cant]) => `- ${cant} x ${CATALOGO_POR_TIPO[tipo].etiqueta}`
      ),
    ];
    const url = `${CONTACTO.whatsappUrl}?text=${encodeURIComponent(lineas.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr_280px]">
      {/* Paleta */}
      <div className="order-2 lg:order-1">
        <h3 className="mb-3 text-lg font-semibold text-teal-dark">Agregar al plano</h3>
        {CATEGORIAS.map((cat) => (
          <div key={cat.id} className="mb-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{cat.titulo}</p>
            <div className="flex flex-wrap gap-2">
              {CATALOGO_ITEMS.filter((d) => d.categoria === cat.id).map((d) => (
                <button
                  key={d.tipo}
                  type="button"
                  onClick={() => agregarItem(d.tipo)}
                  className="rounded-md border border-border bg-white px-3 py-2 text-left text-xs font-medium text-ink hover:border-teal hover:text-teal"
                >
                  + {d.etiqueta}
                  {d.asientos > 0 && <span className="block text-muted">{d.asientos} asientos</span>}
                </button>
              ))}
            </div>
          </div>
        ))}

        {seleccionadoId && (
          <div className="mt-2 flex flex-col gap-2 rounded-md border border-teal bg-teal/5 p-3">
            <p className="text-xs font-semibold text-teal-dark">Elemento seleccionado</p>
            <div className="flex gap-2">
              <button type="button" onClick={rotarSeleccionado} className="flex-1 rounded border border-border bg-white px-2 py-1.5 text-xs hover:border-teal">
                Rotar
              </button>
              <button type="button" onClick={duplicarSeleccionado} className="flex-1 rounded border border-border bg-white px-2 py-1.5 text-xs hover:border-teal">
                Duplicar
              </button>
              <button type="button" onClick={eliminarSeleccionado} className="flex-1 rounded border border-red-300 bg-white px-2 py-1.5 text-xs text-red-600 hover:bg-red-50">
                Quitar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lienzo */}
      <div className="order-1 lg:order-2">
        <div className="mb-4 flex flex-wrap items-end gap-4 rounded-md border border-border bg-white p-4">
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Ancho del salón (m)</span>
            <input
              type="number"
              min={4}
              max={40}
              value={anchoSalonM}
              onChange={(e) => setAnchoSalonM(Math.max(4, Number(e.target.value) || 4))}
              className="w-24 rounded border border-border p-1.5"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Largo del salón (m)</span>
            <input
              type="number"
              min={4}
              max={40}
              value={largoSalonM}
              onChange={(e) => setLargoSalonM(Math.max(4, Number(e.target.value) || 4))}
              className="w-24 rounded border border-border p-1.5"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Invitados</span>
            <input
              type="number"
              min={1}
              max={2000}
              value={invitados}
              onChange={(e) => setInvitados(Math.max(1, Number(e.target.value) || 1))}
              className="w-24 rounded border border-border p-1.5"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Tipo de evento</span>
            <select
              value={estilo}
              onChange={(e) => setEstilo(e.target.value as "banquete" | "coctel")}
              className="rounded border border-border p-1.5"
            >
              <option value="banquete">Banquete sentado</option>
              <option value="coctel">Cóctel de pie</option>
            </select>
          </label>
          <button
            type="button"
            onClick={limpiarTodo}
            className="ml-auto rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:border-red-300 hover:text-red-600"
          >
            Limpiar todo
          </button>
        </div>

        <Canvas
          anchoSalonM={anchoSalonM}
          largoSalonM={largoSalonM}
          items={items}
          seleccionadoId={seleccionadoId}
          onSeleccionar={setSeleccionadoId}
          onMover={moverItem}
        />
        <p className="mt-2 text-xs text-muted">
          Arrastra los elementos para moverlos. Haz clic en uno para rotarlo, duplicarlo o quitarlo.
        </p>
      </div>

      {/* Asistencia */}
      <div className="order-3 flex flex-col gap-4">
        <div className="rounded-md border border-border bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-dark">Asistencia</h3>

          <div className="mb-3">
            <div className="flex justify-between text-sm">
              <span>Asientos colocados</span>
              <span className="font-semibold">{asientosColocados} / {invitados}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full ${asientosColocados >= invitados ? "bg-lime-dark" : "bg-teal"}`}
                style={{ width: `${Math.min(100, (asientosColocados / invitados) * 100)}%` }}
              />
            </div>
            {faltanAsientos > 0 ? (
              <p className="mt-1 text-xs text-muted">Faltan {faltanAsientos} asientos por ubicar.</p>
            ) : (
              <p className="mt-1 text-xs text-teal">Ya cubriste a todos tus invitados.</p>
            )}
          </div>

          <div className="mb-3 rounded-md bg-cream p-3 text-xs">
            <p className="font-semibold text-ink">Espacio del salón</p>
            <p className="mt-1 text-muted">
              Área disponible: <strong>{areaSalon.toFixed(0)} m²</strong>
              <br />
              Referencia recomendada para {invitados} invitados ({estilo === "banquete" ? "sentados" : "de pie"}):{" "}
              <strong>{areaRecomendada.toFixed(0)} m²</strong>
            </p>
            <p className={`mt-2 font-semibold ${espacioSuficiente ? "text-teal" : espacioAjustado ? "text-lime-dark" : "text-red-600"}`}>
              {espacioSuficiente
                ? "✓ El salón alcanza cómodamente."
                : espacioAjustado
                  ? "⚠ Ajustado — considera reducir mobiliario extra."
                  : "✕ Puede quedar muy justo para este número de invitados."}
            </p>
          </div>

          <div className="rounded-md bg-cream p-3 text-xs">
            <p className="mb-2 font-semibold text-ink">Autocompletar mesas</p>
            <select
              value={mesaAuto}
              onChange={(e) => setMesaAuto(e.target.value as TipoItem)}
              className="mb-2 w-full rounded border border-border p-1.5"
            >
              {CATALOGO_ITEMS.filter((d) => d.categoria === "mesas" && d.asientos > 0).map((d) => (
                <option key={d.tipo} value={d.tipo}>{d.etiqueta}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={autocompletarMesas}
              disabled={faltanAsientos === 0}
              className="w-full rounded-md bg-teal-dark px-3 py-2 font-semibold text-white hover:bg-teal disabled:opacity-40"
            >
              Agregar mesas para los {faltanAsientos} restantes
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={enviarPorWhatsApp}
          className="flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-5 py-3 font-semibold text-white hover:brightness-95"
        >
          Enviar este plano por WhatsApp
        </button>
      </div>
    </div>
  );
}
