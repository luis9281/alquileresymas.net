import { createClient } from "@sanity/client";
import { randomInt } from "node:crypto";
import { apiVersion, dataset, projectId } from "./sanity/client";

/**
 * Fair split of incoming quote requests among the sales mailboxes (VENTAS_EMAILS).
 * Each request goes to whoever has received the fewest so far; ties are broken at random.
 * Counters live in one private Sanity document ("reparto.contadores": the "." keeps it hidden
 * from requests without a token), updated with an optimistic lock so two requests arriving at
 * the same moment can't both pick the same person off the same count.
 * Local development uses "reparto-dev.contadores" so tests never move the real counters.
 * See the counts and history with: npm run reparto
 */

const ID = process.env.NODE_ENV === "production" ? "reparto.contadores" : "reparto-dev.contadores";
const DOMINIO = "alquileresymas.net";
const VENTAS_POR_DEFECTO = ["ventas", "ventas1", "ventas2", "ventas3"].map((u) => `${u}@${DOMINIO}`);

const escritura =
  projectId && process.env.SANITY_WRITE_TOKEN
    ? createClient({ projectId, dataset, apiVersion, token: process.env.SANITY_WRITE_TOKEN, useCdn: false })
    : null;

/** Sales mailboxes from VENTAS_EMAILS (comma separated), or the four default ones. */
export function vendedores(): string[] {
  const lista = (process.env.VENTAS_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return lista.length ? lista : VENTAS_POR_DEFECTO;
}

/** Sanity patch paths can't contain "@", "." or "-", so "ventas1@x.net" is stored as "ventas1_x_net". */
const clave = (email: string) => email.replace(/[^a-zA-Z0-9]/g, "_");

const alAzar = <T,>(lista: T[]) => lista[randomInt(lista.length)];

type DocReparto = { _rev: string; conteos?: Record<string, number> };

export type Asignacion = {
  email: string;
  /** How many requests this person has received, counting this one. */
  total: number;
  /** Totals for everyone after this assignment, in VENTAS_EMAILS order. */
  conteos: { email: string; total: number }[];
};

/**
 * Picks the salesperson with the fewest requests and adds one to their counter.
 * Without SANITY_WRITE_TOKEN (or if Sanity fails) it still picks someone at random,
 * so an email always goes out; it just isn't counted.
 */
export async function asignarVendedor(): Promise<Asignacion> {
  const lista = vendedores();
  const sinContar = (): Asignacion => {
    const email = alAzar(lista);
    return { email, total: 0, conteos: lista.map((e) => ({ email: e, total: 0 })) };
  };
  if (!escritura) return sinContar();

  try {
    await escritura.createIfNotExists({ _id: ID, _type: "repartoCorreos", conteos: {} });

    for (let intento = 0; intento < 5; intento++) {
      const doc = await escritura.getDocument<DocReparto>(ID);
      if (!doc) break;
      const conteos = doc.conteos ?? {};
      const minimo = Math.min(...lista.map((e) => conteos[clave(e)] ?? 0));
      const email = alAzar(lista.filter((e) => (conteos[clave(e)] ?? 0) === minimo));
      const ruta = `conteos.${clave(email)}`;

      try {
        // ifRevisionId fails if someone else updated the counters since we read them; then we retry.
        await escritura
          .patch(ID)
          .ifRevisionId(doc._rev)
          .setIfMissing({ [ruta]: 0 })
          .inc({ [ruta]: 1 })
          .set({ ultimo: { email, fecha: new Date().toISOString() } })
          .commit();
        const nuevos = { ...conteos, [clave(email)]: minimo + 1 };
        return { email, total: minimo + 1, conteos: lista.map((e) => ({ email: e, total: nuevos[clave(e)] ?? 0 })) };
      } catch (error) {
        if ((error as { statusCode?: number }).statusCode !== 409) throw error;
      }
    }
  } catch (error) {
    console.error("Error en el reparto de correos, se asigna al azar sin contar:", error);
  }
  return sinContar();
}

/** Takes back the count when the email to that person couldn't be sent. */
export async function devolverAsignacion(email: string): Promise<void> {
  if (!escritura) return;
  await escritura
    .patch(ID)
    .inc({ [`conteos.${clave(email)}`]: -1 })
    .commit()
    .catch((error) => console.error("Error devolviendo la asignacion:", error));
}

/** "ventas2@alquileresymas.net: 5 | ventas3@...: 4 ..." for the WhatsApp notice and the email footer. */
export const resumenConteos = (a: Asignacion) => a.conteos.map((c) => `${c.email.split("@")[0]}: ${c.total}`).join(" | ");
