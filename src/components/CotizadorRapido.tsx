"use client";

import { useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Turnstile, { type TurnstileHandle } from "./Turnstile";
import { normalizar } from "./BuscadorProductos";
import { CONTACTO } from "@/lib/site-info";
import { esImagenSanity } from "@/lib/images";
import { formatoPrecio } from "@/lib/precio";
import { trackLead } from "@/lib/analytics";
import {
  AVISO_DISPONIBILIDAD,
  AVISO_TRANSPORTE,
  calcularTotales,
  ITBMS,
  textoCotizacion,
  ZONAS_TRANSPORTE,
  zonaSugerida,
  type CotizacionRapida,
} from "@/lib/cotizador";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const MAX_SUGERENCIAS = 10;

export type OpcionProducto = {
  /** "<productoId>::<varianteIdx>" */
  id: string;
  titulo: string;
  categoria: string;
  precio?: number;
  imagen?: string;
};

type Linea = OpcionProducto & { qty: number };

/** "sillas" also finds "Silla", "manteles" finds "Mantel". */
function variantesDe(palabra: string): string[] {
  if (palabra.length <= 3) return [palabra];
  return [palabra, palabra.replace(/s$/, ""), palabra.replace(/es$/, "")];
}

/**
 * Every word typed must appear (in any order) in the name, color or category.
 * Ranking: name starts with the query > a word of the name starts with it > anywhere.
 */
function buscar(consulta: string, opciones: { op: OpcionProducto; texto: string; nombre: string }[]) {
  const q = normalizar(consulta.trim());
  if (q.length < 2) return [];
  const palabras = q.split(/\s+/).map(variantesDe);
  const rango = (nombre: string) =>
    nombre.startsWith(q) ? 0 : palabras[0].some((p) => ` ${nombre}`.includes(` ${p}`)) ? 1 : 2;
  return opciones
    .filter((o) => palabras.every((vs) => vs.some((v) => o.texto.includes(v))))
    .sort((a, b) => rango(a.nombre) - rango(b.nombre) || a.op.titulo.localeCompare(b.op.titulo, "es"))
    .slice(0, MAX_SUGERENCIAS)
    .map((o) => o.op);
}

function Tarjeta({
  titulo,
  children,
  accion,
  className = "",
  tour,
}: {
  titulo: string;
  children: React.ReactNode;
  accion?: React.ReactNode;
  className?: string;
  /** Anchor for the guided tour (TourCotizador). */
  tour?: string;
}) {
  return (
    <div data-tour={tour} className={`rounded-lg border border-border bg-white ${className}`}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-sans text-base font-semibold text-ink">{titulo}</h2>
        {accion}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Campo({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      {/* 16px on phones: iOS zooms into any field with smaller text on focus. */}
      <input {...props} className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-base text-ink sm:text-sm" />
    </label>
  );
}

/** − / number / + stepper; 44px buttons so a thumb hits them on a phone. */
function ControlCantidad({ titulo, qty, onChange }: { titulo: string; qty: number; onChange: (qty: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-md border border-border">
      <button type="button" onClick={() => onChange(qty - 1)} className="h-11 w-11 text-lg text-muted hover:text-ink" aria-label={`Quitar uno de ${titulo}`}>
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={qty}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-14 border-x border-border text-center text-base sm:text-sm"
        aria-label={`Cantidad de ${titulo}`}
      />
      <button type="button" onClick={() => onChange(qty + 1)} className="h-11 w-11 text-lg text-muted hover:text-ink" aria-label={`Añadir uno de ${titulo}`}>
        +
      </button>
    </div>
  );
}

function BotonQuitar({ titulo, onClick }: { titulo: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-xl text-muted hover:bg-cream hover:text-ink"
      aria-label={`Quitar ${titulo}`}
    >
      ×
    </button>
  );
}

export default function CotizadorRapido({ opciones }: { opciones: OpcionProducto[] }) {
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [direccion, setDireccion] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  // null = the visitor hasn't picked a zone, so it follows the address.
  const [zonaElegida, setZonaElegida] = useState<string | null>(null);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [consulta, setConsulta] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const [ubicando, setUbicando] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [mensaje, setMensaje] = useState("");
  const listaId = useId();
  const buscadorRef = useRef<HTMLInputElement>(null);
  const captchaRef = useRef<TurnstileHandle>(null);
  const router = useRouter();

  const indice = useMemo(
    () => opciones.map((op) => ({ op, nombre: normalizar(op.titulo), texto: normalizar(`${op.titulo} ${op.categoria}`) })),
    [opciones]
  );
  const sugerencias = useMemo(() => buscar(consulta, indice), [consulta, indice]);
  const mostrarLista = abierto && consulta.trim().length >= 2;

  const sugerida = zonaSugerida(direccion);
  const zonaId = zonaElegida ?? sugerida?.id ?? "";
  const zona = ZONAS_TRANSPORTE.find((z) => z.id === zonaId);
  const totales = calcularTotales(lineas, zona ? zona.costo : 0);

  const dias =
    desde && hasta && hasta >= desde ? Math.round((Date.parse(hasta) - Date.parse(desde)) / 86_400_000) + 1 : null;

  // What the map preview shows: the pasted link's coordinates, else the typed address.
  const coords = mapsUrl.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
  const consultaMapa = coords ? `${coords[1]},${coords[2]}` : direccion.trim().length > 5 ? `${direccion}, Panamá` : "";

  function agregar(op: OpcionProducto) {
    setLineas((prev) =>
      prev.some((l) => l.id === op.id) ? prev.map((l) => (l.id === op.id ? { ...l, qty: l.qty + 1 } : l)) : [...prev, { ...op, qty: 1 }]
    );
    setConsulta("");
    setActivo(0);
    buscadorRef.current?.focus();
  }

  const cambiarQty = (id: string, qty: number) =>
    setLineas((prev) => prev.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.floor(qty) || 1) } : l)));

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && sugerencias.length) {
      e.preventDefault();
      setAbierto(true);
      setActivo((i) => (i + 1) % sugerencias.length);
    } else if (e.key === "ArrowUp" && sugerencias.length) {
      e.preventDefault();
      setActivo((i) => (i <= 0 ? sugerencias.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (sugerencias[activo]) agregar(sugerencias[activo]);
    } else if (e.key === "Escape") {
      if (mostrarLista) setAbierto(false);
      else setConsulta("");
    }
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) return;
    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        setMapsUrl(`https://www.google.com/maps?q=${c.latitude.toFixed(6)},${c.longitude.toFixed(6)}`);
        setUbicando(false);
      },
      () => setUbicando(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function datos(): CotizacionRapida {
    return {
      empresa,
      email,
      whatsapp,
      direccion,
      mapsUrl,
      desde,
      hasta,
      observaciones,
      zonaId,
      lineas: lineas.map(({ id, titulo, qty, precio }) => ({ id, titulo, qty, precio })),
    };
  }

  /** What the API needs: it looks prices up itself, so lines only carry id and quantity. */
  const cuerpoApi = (extra: Record<string, string>) =>
    JSON.stringify({ ...datos(), lineas: lineas.map(({ id, qty }) => ({ id, qty })), ...extra });

  /** Native validation first, so both buttons ask for the same required fields. */
  function listo(form: HTMLFormElement | null): boolean {
    if (!form?.reportValidity()) return false;
    if (!lineas.length) {
      setStatus("error");
      setMensaje("Agrega al menos un producto a la cotización.");
      buscadorRef.current?.focus();
      return false;
    }
    return true;
  }

  async function enviarCorreo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!listo(event.currentTarget)) return;
    setStatus("sending");
    setMensaje("");
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/cotizador-rapido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: cuerpoApi({
          website: String(form.get("website") || ""),
          captchaToken: String(form.get("cf-turnstile-response") || ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMensaje(data.error || "No se pudo enviar la cotización.");
        captchaRef.current?.reset();
        return;
      }
      trackLead("cotizador_rapido_correo", { value: totales.total, currency: "USD", productos: lineas.length });
      router.push("/gracias");
    } catch {
      setStatus("error");
      setMensaje("No se pudo enviar la cotización. Revisa tu conexión e intenta de nuevo.");
      captchaRef.current?.reset();
    }
  }

  function enviarWhatsApp(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    if (!listo(form)) return;
    const texto = textoCotizacion(datos(), (t) => `*${t}*`);
    trackLead("cotizador_rapido_whatsapp", { value: totales.total, currency: "USD", productos: lineas.length });
    window.open(`${CONTACTO.whatsappUrl}?text=${encodeURIComponent(texto)}`, "_blank", "noopener,noreferrer");
    // Fire-and-forget: keeps WhatsApp quotes in the request log too.
    fetch("/api/cotizador-rapido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: cuerpoApi({ canal: "whatsapp", website: String(new FormData(form!).get("website") || "") }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <form onSubmit={enviarCorreo} className="flex flex-col gap-5">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Tarjeta titulo="Cliente" tour="cliente">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Campo label="Nombre de la empresa o cliente *" required value={empresa} onChange={(e) => setEmpresa(e.target.value)} autoComplete="organization" />
              </div>
              <Campo label="Correo electrónico *" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <Campo
                label="WhatsApp *"
                type="tel"
                required
                pattern="[\d\s+\-\(\)]{7,}"
                title="Escribe un número de WhatsApp válido, ej. +507 6000-0000"
                placeholder="+507 6000-0000"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                autoComplete="tel"
              />
            </div>
          </Tarjeta>

          <Tarjeta
            titulo="Fecha del evento"
            tour="fecha"
            accion={
              (desde || hasta) && (
                <button
                  type="button"
                  onClick={() => {
                    setDesde("");
                    setHasta("");
                  }}
                  className="-my-2 -mr-2 min-h-11 rounded-md px-3 text-sm text-muted hover:bg-cream hover:text-ink"
                >
                  × Borrar
                </button>
              )
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                label="Desde *"
                type="date"
                required
                value={desde}
                onChange={(e) => {
                  setDesde(e.target.value);
                  if (!hasta || hasta < e.target.value) setHasta(e.target.value);
                }}
              />
              <Campo label="Hasta *" type="date" required min={desde || undefined} value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </div>
            {dias && <p className="mt-3 text-sm text-muted">{dias === 1 ? "1 día de evento" : `${dias} días de evento`}</p>}
          </Tarjeta>

          <Tarjeta titulo="Observaciones del pedido" className="flex-1">
            <textarea
              rows={4}
              aria-label="Observaciones del pedido"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Horario de montaje, piso, acceso, colores, tipo de evento…"
              className="w-full rounded-md border border-border bg-white p-3 text-base sm:text-sm"
            />
          </Tarjeta>
        </div>

        <Tarjeta titulo="Dirección de entrega">
          <div className="flex flex-col gap-4">
            <div data-tour="direccion">
              <Campo label="Dirección" placeholder="Ej. Hotel Sortis, Calle 56 Obarrio" value={direccion} onChange={(e) => setDireccion(e.target.value)} autoComplete="street-address" />
            </div>
            <div>
              <Campo label="Ubicación en Google Maps (opcional)" type="url" placeholder="Pega aquí el enlace de Google Maps" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} />
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(direccion ? `${direccion}, Panamá` : "Panamá")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-md border border-border px-3 font-medium text-teal hover:bg-teal/10"
                >
                  Buscar en Google Maps ↗
                </a>
                <button type="button" onClick={usarMiUbicacion} disabled={ubicando} className="inline-flex min-h-11 items-center rounded-md border border-border px-3 font-medium text-teal hover:bg-teal/10 disabled:opacity-60">
                  {ubicando ? "Ubicando…" : "📍 Usar mi ubicación actual"}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted">En Google Maps toca el lugar → Compartir → Copiar enlace, y pégalo arriba.</p>
            </div>
            {consultaMapa ? (
              <iframe
                title="Vista previa de la dirección de entrega"
                src={`https://www.google.com/maps?q=${encodeURIComponent(consultaMapa)}&z=15&output=embed`}
                className="h-56 w-full rounded-md border border-border"
                loading="lazy"
              />
            ) : (
              <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-border bg-cream px-6 text-center text-sm text-muted">
                Escribe la dirección o pega el enlace de Google Maps para ver el mapa aquí.
              </div>
            )}

            <div className="border-t border-border pt-4" data-tour="transporte">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-ink">¿Necesitas transporte (entrega y recogida)?</span>
                <select
                  value={zonaId}
                  onChange={(e) => setZonaElegida(e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-base text-ink sm:text-sm"
                >
                  <option value="">No, retiro en el local (sin costo)</option>
                  {ZONAS_TRANSPORTE.map((z) => (
                    <option key={z.id} value={z.id}>
                      Sí — {z.nombre} {z.costo === null ? "(por confirmar)" : `(desde ${formatoPrecio(z.costo)})`}
                    </option>
                  ))}
                </select>
              </label>
              {zonaElegida === null && sugerida && (
                <p className="mt-2 text-xs text-teal">Zona sugerida según tu dirección de entrega. Puedes cambiarla.</p>
              )}
              {zona && (
                <p className="mt-2 rounded-md bg-cream px-3 py-2 text-xs text-ink">
                  ⚠️ {zona.costo === null && "El costo a esta zona se confirma al revisar la dirección. "}
                  {AVISO_TRANSPORTE}
                </p>
              )}
            </div>
          </div>
        </Tarjeta>
      </div>

      <div className="rounded-lg border border-border bg-white">
        <div className="relative p-5" data-tour="productos">
          <label htmlFor={`${listaId}-input`} className="sr-only">Buscar para añadir productos</label>
          <svg className="pointer-events-none absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          <input
            id={`${listaId}-input`}
            ref={buscadorRef}
            type="search"
            role="combobox"
            aria-expanded={mostrarLista}
            aria-controls={listaId}
            aria-autocomplete="list"
            aria-activedescendant={mostrarLista && sugerencias[activo] ? `${listaId}-${activo}` : undefined}
            autoComplete="off"
            value={consulta}
            placeholder="Buscar para añadir productos (ej. silla tiffany dorada, mantel redondo, copa)…"
            onChange={(e) => {
              setConsulta(e.target.value);
              setAbierto(true);
              setActivo(0);
            }}
            onFocus={() => setAbierto(true)}
            onBlur={() => setAbierto(false)}
            onKeyDown={onKeyDown}
            className="w-full rounded-md border border-border bg-white py-3 pl-10 pr-3 text-base text-ink sm:text-sm"
          />
          {mostrarLista && (
            <ul id={listaId} role="listbox" className="absolute left-5 right-5 top-full z-30 -mt-3 max-h-96 overflow-y-auto rounded-md border border-border bg-white py-1 shadow-lg">
              {sugerencias.length === 0 && <li className="px-4 py-3 text-sm text-muted">No encontramos productos con &ldquo;{consulta}&rdquo;.</li>}
              {sugerencias.map((op, i) => (
                <li
                  key={op.id}
                  id={`${listaId}-${i}`}
                  role="option"
                  aria-selected={i === activo}
                  // mousedown (not click) so it fires before the input's blur closes the list.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    agregar(op);
                  }}
                  onMouseEnter={() => setActivo(i)}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${i === activo ? "bg-teal/10" : ""}`}
                >
                  <Miniatura src={op.imagen} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{op.titulo}</span>
                    <span className="block truncate text-xs text-muted">{op.categoria}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-teal-dark">
                    {op.precio === undefined ? "Por cotizar" : formatoPrecio(op.precio)}
                  </span>
                  {lineas.some((l) => l.id === op.id) && <span className="shrink-0 text-xs text-teal">✓ agregado</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Phones: one card per line, no sideways scroll. md and up: the table. */}
        {lineas.length === 0 ? (
          <p className="border-t border-border px-5 py-10 text-center text-muted">
            Aún no hay productos. Escribe en el buscador de arriba para añadirlos.
          </p>
        ) : (
          <>
            <ul className="border-t border-border md:hidden">
              {lineas.map((l) => (
                <li key={l.id} className="flex gap-3 border-b border-border py-4 pl-5 pr-2">
                  <Miniatura src={l.imagen} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{l.titulo}</p>
                    <p className="text-sm text-muted">
                      {l.precio === undefined ? "Por cotizar" : `${formatoPrecio(l.precio)} c/u`}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <ControlCantidad titulo={l.titulo} qty={l.qty} onChange={(q) => cambiarQty(l.id, q)} />
                      <span className="font-semibold tabular-nums text-ink">
                        {l.precio === undefined ? "—" : formatoPrecio(l.precio * l.qty)}
                      </span>
                    </div>
                  </div>
                  <BotonQuitar titulo={l.titulo} onClick={() => setLineas((prev) => prev.filter((x) => x.id !== l.id))} />
                </li>
              ))}
            </ul>

            <table className="hidden w-full text-sm md:table">
              <thead>
                <tr className="border-y border-border text-left text-ink">
                  <th className="px-5 py-3 font-semibold">Producto</th>
                  <th className="px-3 py-3 font-semibold">Cantidad</th>
                  <th className="px-3 py-3 text-right font-semibold">Precio unit.</th>
                  <th className="px-3 py-3 text-right font-semibold">Total</th>
                  <th className="w-14" />
                </tr>
              </thead>
              <tbody>
                {lineas.map((l) => (
                  <tr key={l.id} className="border-b border-border">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Miniatura src={l.imagen} />
                        <div>
                          <p className="font-semibold text-ink">{l.titulo}</p>
                          <p className="text-xs text-muted">{l.categoria}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <ControlCantidad titulo={l.titulo} qty={l.qty} onChange={(q) => cambiarQty(l.id, q)} />
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {l.precio === undefined ? <span className="text-muted">Por cotizar</span> : formatoPrecio(l.precio)}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums">
                      {l.precio === undefined ? "—" : formatoPrecio(l.precio * l.qty)}
                    </td>
                    <td className="px-1 py-3">
                      <BotonQuitar titulo={l.titulo} onClick={() => setLineas((prev) => prev.filter((x) => x.id !== l.id))} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div className="grid gap-8 p-5 md:grid-cols-[1fr_340px]">
          <div className="order-2 flex flex-col gap-3 md:order-1">
            <div className="rounded-md border border-lime-dark/40 bg-lime/15 px-4 py-3 text-sm text-ink">
              <p className="font-semibold">⚠️ {AVISO_DISPONIBILIDAD}</p>
              <p className="mt-1">
                Este total es un <strong>estimado, no el precio final</strong>. El transporte también está sujeto a la
                cantidad de artículos y a la distancia; nuestro equipo te confirmará el monto final.
              </p>
            </div>
            {status === "error" && <p className="rounded-md bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">{mensaje}</p>}
            {TURNSTILE_SITE_KEY && <Turnstile ref={captchaRef} siteKey={TURNSTILE_SITE_KEY} />}
            <div className="flex flex-col gap-3 sm:flex-row" data-tour="enviar">
              <button type="submit" disabled={status === "sending"} className="flex-1 rounded-md bg-lime px-6 py-3 font-semibold text-teal-dark hover:bg-lime-dark disabled:opacity-60">
                {status === "sending" ? "Enviando…" : "✉️ Enviar por correo"}
              </button>
              <button type="button" onClick={enviarWhatsApp} className="flex flex-1 items-center justify-center gap-2 rounded-md bg-whatsapp px-6 py-3 font-semibold text-whatsapp-ink hover:brightness-95">
                Enviar por WhatsApp
              </button>
            </div>
            <p className="text-xs text-muted">
              Se envía a {CONTACTO.emails.gerencia} / WhatsApp {CONTACTO.telefono}. Al enviar aceptas nuestra{" "}
              <Link href="/politica-de-privacidad" className="text-teal underline">política de privacidad</Link>.
            </p>
          </div>

          <div className="order-1 text-sm md:order-2">
            {/* Only dt/dd groups inside the dl (notes go after it) so screen readers read it as a list of totals. */}
            <dl className="space-y-2">
              <Fila label="Subtotal" valor={formatoPrecio(totales.subtotal)} />
              <Fila
                label={zona ? `Transporte (${zona.nombre})` : "Transporte"}
                valor={!zona ? "Retiro en local" : zona.costo === null ? "Por confirmar" : `${formatoPrecio(zona.costo)}*`}
              />
              <Fila
                className="border-t border-border pt-2"
                label="Total sin impuestos"
                valor={formatoPrecio(totales.subtotal + totales.transporte)}
              />
              <Fila label={`ITBMS (${Math.round(ITBMS * 100)}%)`} valor={formatoPrecio(totales.itbms)} />
              <Fila
                className="border-t border-border pt-2 text-base font-bold text-ink"
                label="Total estimado con ITBMS"
                valor={formatoPrecio(totales.total)}
              />
            </dl>
            {zona && <p className="mt-2 text-xs text-muted">* Transporte estimado, sujeto a cantidad y distancia.</p>}
            {totales.pendientes && <p className="mt-2 text-xs text-muted">+ montos por confirmar (productos o transporte sin precio publicado).</p>}
          </div>
        </div>
      </div>
    </form>
  );
}

function Fila({ label, valor, className = "" }: { label: string; valor: string; className?: string }) {
  return (
    <div className={`flex justify-between gap-4 ${className}`}>
      <dt>{label}</dt>
      <dd className="text-right tabular-nums">{valor}</dd>
    </div>
  );
}

function Miniatura({ src }: { src?: string }) {
  if (!src) return <span className="h-10 w-10 shrink-0 rounded bg-cream" />;
  return <Image src={src} alt="" width={40} height={40} unoptimized={esImagenSanity(src)} className="h-10 w-10 shrink-0 rounded object-cover" />;
}
