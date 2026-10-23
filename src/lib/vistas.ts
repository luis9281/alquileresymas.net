import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId, sanityClient } from "./sanity/client";
import type { Producto } from "./types";

/**
 * Weekly product-page view counter, stored in Sanity as one "vistasSemana"
 * document per ISO week (Monday to Sunday, Panama time):
 *   { _id: "vistas-2026-W43", semana: "2026-W43", conteos: { producto_mesas_x: 12, ... } }
 * The home page ranks last week's counts, so "Lo más visto" changes every Monday.
 * Local development writes to "vistas-dev-*" so test visits never touch the real ranking.
 */

const PREFIJO = process.env.NODE_ENV === "production" ? "vistas" : "vistas-dev";
const PANAMA_UTC_OFFSET_MS = -5 * 60 * 60 * 1000; // UTC-5 all year, no daylight saving

/** "2026-W43" for the ISO week that contains `fecha` in Panama. */
export function semanaDe(fecha: Date): string {
  const d = new Date(fecha.getTime() + PANAMA_UTC_OFFSET_MS);
  const dia = d.getUTCDay() || 7; // Monday = 1 ... Sunday = 7
  d.setUTCDate(d.getUTCDate() + 4 - dia); // Thursday decides the ISO year
  const inicioAnio = Date.UTC(d.getUTCFullYear(), 0, 1);
  const numero = Math.ceil(((d.getTime() - inicioAnio) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(numero).padStart(2, "0")}`;
}

const idSemana = (semana: string) => `${PREFIJO}-${semana}`;

/** Sanity patch paths can't contain "-", so "producto-mesas-x" is stored as "producto_mesas_x". */
const clave = (productoId: string) => productoId.replace(/[^a-zA-Z0-9]/g, "_");

export const ID_PRODUCTO_VALIDO = /^producto-[a-z0-9-]{1,100}$/;

const escritura =
  projectId && process.env.SANITY_WRITE_TOKEN
    ? createClient({ projectId, dataset, apiVersion, token: process.env.SANITY_WRITE_TOKEN, useCdn: false })
    : null;

/** Adds one view to `productoId` in the current week. No-op when SANITY_WRITE_TOKEN isn't set. */
export async function registrarVista(productoId: string): Promise<void> {
  if (!escritura) return;
  const semana = semanaDe(new Date());
  const _id = idSemana(semana);
  const ruta = `conteos.${clave(productoId)}`;
  await escritura
    .transaction()
    .createIfNotExists({ _id, _type: "vistasSemana", semana, conteos: {} })
    .patch(_id, (p) => p.setIfMissing({ [ruta]: 0 }).inc({ [ruta]: 1 }))
    .commit({ visibility: "async" });
}

export type MasVistos = {
  productos: Producto[];
  /** True when the list comes from real visits (at least one product), false when it's all fallback picks. */
  conDatos: boolean;
};

/**
 * Top `cantidad` products by views in the last completed week. Weeks with no data yet
 * (e.g. right after launch) fall back to the current week, and any empty slots are filled
 * with `relleno`, in order, so the section always shows a full row.
 */
export async function getMasVistos(productos: Producto[], relleno: Producto[], cantidad: number): Promise<MasVistos> {
  const ahora = new Date();
  const semanaPasada = semanaDe(new Date(ahora.getTime() - 7 * 86400000));
  const docs: { _id: string; conteos?: Record<string, number> }[] =
    (await sanityClient
      ?.fetch(`*[_type == "vistasSemana" && _id in $ids]{ _id, conteos }`, {
        ids: [idSemana(semanaPasada), idSemana(semanaDe(ahora))],
      })
      .catch(() => [])) ?? [];

  const conteos =
    docs.find((d) => d._id === idSemana(semanaPasada) && Object.keys(d.conteos ?? {}).length > 0)?.conteos ??
    docs.find((d) => d._id !== idSemana(semanaPasada))?.conteos ??
    {};

  const porClave = new Map(productos.map((p) => [clave(p._id), p]));
  const ranking = Object.entries(conteos)
    .filter(([k, n]) => porClave.has(k) && n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, cantidad)
    .map(([k]) => porClave.get(k)!);

  const elegidos = new Set(ranking.map((p) => p._id));
  const resto: Producto[] = [];
  for (const p of relleno) {
    if (resto.length + ranking.length >= cantidad) break;
    if (elegidos.has(p._id)) continue;
    elegidos.add(p._id);
    resto.push(p);
  }
  return { productos: [...ranking, ...resto], conDatos: ranking.length > 0 };
}
