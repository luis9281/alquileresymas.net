/**
 * Compresses a folder of photos before you drag them into /studio by hand.
 * Originals are never modified: optimized copies go to "<carpeta>-optimizadas"
 * (same subfolder structure), ready to upload.
 *
 * Usage:
 *
 *   npm run optimizar:imagenes -- "C:\ruta\a\mis-fotos"
 *   npm run optimizar:imagenes            (defaults to ./productos)
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, extname, resolve, relative, dirname } from "node:path";
import { optimizarImagen, cambiarExtension, kb } from "./lib/optimizar-imagen.mjs";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const origen = resolve(process.argv[2] || "productos");
const destino = `${origen}-optimizadas`;

function listarImagenes(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) return listarImagenes(ruta);
    return IMAGE_EXTENSIONS.has(extname(nombre).toLowerCase()) ? [ruta] : [];
  });
}

let antes = 0;
let despues = 0;
const imagenes = listarImagenes(origen);

for (const ruta of imagenes) {
  const original = readFileSync(ruta);
  const { buffer, ext, optimizada } = await optimizarImagen(original);
  const rel = relative(origen, ruta);
  const salida = join(destino, optimizada ? cambiarExtension(rel, ext) : rel);
  mkdirSync(dirname(salida), { recursive: true });
  writeFileSync(salida, buffer);
  antes += original.length;
  despues += buffer.length;
  console.log(`${optimizada ? "✓" : "="} ${rel}: ${kb(original.length)} -> ${kb(buffer.length)}`);
}

console.log(
  `\n${imagenes.length} imágenes: ${kb(antes)} -> ${kb(despues)}` +
    `\nListas para subir en: ${destino}`
);
