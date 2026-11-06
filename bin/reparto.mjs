/**
 * Shows how quote requests have been split among the sales mailboxes (src/lib/reparto.ts)
 * and writes the full history to privado/reparto-correos.txt (date; who got it; client; form).
 * The privado/ folder is in .gitignore so client emails never reach git.
 *
 * Usage: npm run reparto          (real requests from the website)
 *        npm run reparto -- --dev (test requests made from localhost)
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
const [contadores, solicitudes] = await Promise.all([
  client.getDocument(dev ? "reparto-dev.contadores" : "reparto.contadores"),
  client.fetch(
    `*[_type == "solicitudCotizacion" && defined(asignadoA) && _id in path($ruta)] | order(fecha asc){ fecha, asignadoA, nombre, email, telefono, origen }`,
    { ruta: dev ? "solicitud-dev.*" : "solicitud.*" }
  ),
]);

// Panama is UTC-5 all year.
const fechaPanama = (iso) => new Date(new Date(iso).getTime() - 5 * 3600000).toISOString().slice(0, 16).replace("T", " ");
const limpiar = (v) => String(v ?? "").replace(/[;\r\n]+/g, " ").trim();

console.log("Contadores del reparto (los que deciden a quien le toca):");
const conteos = Object.entries(contadores?.conteos ?? {}).sort((a, b) => a[0].localeCompare(b[0]));
if (!conteos.length) console.log("  (todavia no hay envios)");
for (const [clave, n] of conteos) console.log(`  ${clave.replace(/_alquileresymas_net$/, "@alquileresymas.net").padEnd(32)} ${n}`);
if (contadores?.ultimo) console.log(`  Ultimo: ${contadores.ultimo.email} el ${fechaPanama(contadores.ultimo.fecha)}`);

const porMes = new Map();
for (const s of solicitudes) {
  const mes = fechaPanama(s.fecha).slice(0, 7);
  const fila = porMes.get(mes) ?? {};
  fila[s.asignadoA] = (fila[s.asignadoA] ?? 0) + 1;
  porMes.set(mes, fila);
}
if (porMes.size) {
  console.log("\nPor mes (segun el log de solicitudes):");
  for (const [mes, fila] of porMes) {
    console.log(`  ${mes}  ${Object.entries(fila).map(([e, n]) => `${e.split("@")[0]}: ${n}`).join(" | ")}`);
  }
}

const lineas = [
  "fecha;asignadoA;cliente;email;telefono;formulario",
  ...solicitudes.map((s) =>
    [fechaPanama(s.fecha), s.asignadoA, s.nombre, s.email, s.telefono, s.origen ?? "cotizacion"].map(limpiar).join(";")
  ),
];
const archivo = dev ? "privado/reparto-correos-dev.txt" : "privado/reparto-correos.txt";
mkdirSync("privado", { recursive: true });
// BOM so Excel opens the accents correctly.
writeFileSync(archivo, "﻿" + lineas.join("\r\n") + "\r\n", "utf8");
console.log(`\n${solicitudes.length} envios en el historial -> ${archivo}`);
