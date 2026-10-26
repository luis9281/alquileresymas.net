/**
 * Exports the private quote-request log (src/lib/solicitudes-log.ts) to
 * privado/solicitudes-correos.txt: one request per line, fields separated by ";",
 * oldest first. The privado/ folder is in .gitignore so the emails never reach git.
 *
 * Usage: npm run exportar:solicitudes          (real requests from the website)
 *        npm run exportar:solicitudes -- --dev (test requests made from localhost)
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
  `*[_type == "solicitudCotizacion" && _id in path($ruta)] | order(fecha asc)`,
  { ruta: dev ? "solicitud-dev.*" : "solicitud.*" }
);

const columnas = ["fecha", "nombre", "email", "telefono", "fechaEvento", "lugar", "productos"];
// The separator or a line break inside a field would break the columns.
const limpiar = (v) => String(v ?? "").replace(/[;\r\n]+/g, " ").trim();
// Panama is UTC-5 all year.
const fechaPanama = (iso) => new Date(new Date(iso).getTime() - 5 * 3600000).toISOString().slice(0, 16).replace("T", " ");

const lineas = [
  columnas.join(";"),
  ...solicitudes.map((s) => columnas.map((c) => limpiar(c === "fecha" ? fechaPanama(s.fecha) : s[c])).join(";")),
];

const archivo = dev ? "privado/solicitudes-correos-dev.txt" : "privado/solicitudes-correos.txt";
mkdirSync("privado", { recursive: true });
// BOM so Excel opens the accents correctly.
writeFileSync(archivo, "﻿" + lineas.join("\r\n") + "\r\n", "utf8");

const unicos = new Set(solicitudes.map((s) => String(s.email).toLowerCase()));
console.log(`${solicitudes.length} solicitudes (${unicos.size} correos distintos) -> ${archivo}`);
