/**
 * Exports every "Cotizador rápido" request saved in Sanity (src/lib/solicitudes-log.ts, origen
 * "cotizador-rapido") to privado/cotizador-rapido-web.txt, oldest first, with the full quote
 * text. The privado/ folder is in .gitignore so the emails never reach git.
 *
 * Usage: npm run exportar:cotizador          (real requests from the website)
 *        npm run exportar:cotizador -- --dev (test requests made from localhost)
 */
import { createClient } from "@sanity/client";
import { mkdirSync, writeFileSync } from "node:fs";

const { NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN } = process.env;

if (!NEXT_PUBLIC_SANITY_PROJECT_ID || !SANITY_API_TOKEN) {
  console.error("Faltan NEXT_PUBLIC_SANITY_PROJECT_ID y/o SANITY_API_TOKEN en .env.local");
  process.exit(1);
}

const client = createClient({
  projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-01-01",
  token: SANITY_API_TOKEN,
  useCdn: false,
  perspective: "raw",
});

const dev = process.argv.includes("--dev");
const solicitudes = await client.fetch(
  `*[_type == "solicitudCotizacion" && origen == "cotizador-rapido" && _id in path($ruta)] | order(fecha asc)`,
  { ruta: dev ? "solicitud-dev.*" : "solicitud.*" }
);

// Panama is UTC-5 all year.
const fechaPanama = (iso) => new Date(new Date(iso).getTime() - 5 * 3600000).toISOString().slice(0, 16).replace("T", " ");
const raya = "=".repeat(60);

const bloques = solicitudes.map((s) => [raya, fechaPanama(s.fecha), raya, s.detalle ?? s.productos, ""].join("\r\n"));

const archivo = dev ? "privado/cotizador-rapido-web-dev.txt" : "privado/cotizador-rapido-web.txt";
mkdirSync("privado", { recursive: true });
// BOM so Notepad/Excel open the accents correctly.
writeFileSync(archivo, "﻿" + bloques.join("\r\n").replace(/\r?\n/g, "\r\n") + "\r\n", "utf8");

console.log(`${solicitudes.length} cotizaciones -> ${archivo}`);
