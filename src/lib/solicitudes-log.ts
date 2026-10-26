import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";
import { apiVersion, dataset, projectId } from "./sanity/client";
import type { QuoteItem } from "./types";

/**
 * Private log of quote requests, stored in Sanity as one "solicitudCotizacion" document each.
 * The _id has a "." ("solicitud.<uuid>"), and Sanity never returns dotted ids to requests
 * without a token, so the dataset being public doesn't expose these emails.
 * Export them to a .txt with: npm run exportar:solicitudes
 * Local development writes to "solicitud-dev.*" so tests never mix with real requests.
 */

const PREFIJO = process.env.NODE_ENV === "production" ? "solicitud" : "solicitud-dev";

const escritura =
  projectId && process.env.SANITY_WRITE_TOKEN
    ? createClient({ projectId, dataset, apiVersion, token: process.env.SANITY_WRITE_TOKEN, useCdn: false })
    : null;

export type Solicitud = {
  nombre: string;
  email: string;
  telefono: string;
  fechaEvento: string;
  lugar: string;
  items: QuoteItem[];
};

/** Saves one request. No-op when SANITY_WRITE_TOKEN isn't set. */
export async function registrarSolicitud(s: Solicitud): Promise<void> {
  if (!escritura) return;
  await escritura.create({
    _id: `${PREFIJO}.${randomUUID()}`,
    _type: "solicitudCotizacion",
    fecha: new Date().toISOString(),
    nombre: s.nombre,
    email: s.email,
    telefono: s.telefono,
    fechaEvento: s.fechaEvento,
    lugar: s.lugar,
    productos: s.items.map((i) => `${i.title} x${i.qty}`).join(", "),
  });
}
