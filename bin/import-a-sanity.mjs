/**
 * One-time importer: turns every image inside /productos/<categoria>/ into
 * a DRAFT "producto" document in Sanity, tagged with the matching
 * categoriaProducto, so you don't have to re-upload everything by hand
 * through Studio.
 *
 * Documents are created as drafts (id prefixed "drafts."), so nothing goes
 * live on the site until you review and hit "Publish" on each one in
 * /studio. Safe to re-run: existing categories/products are left untouched
 * (createIfNotExists), so re-running only picks up new files.
 *
 * Usage (needs SANITY_API_TOKEN with "Editor" permissions in .env.local):
 *
 *   node --env-file=.env.local bin/import-a-sanity.mjs
 */
import { createClient } from "@sanity/client";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const { NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN } = process.env;

if (!NEXT_PUBLIC_SANITY_PROJECT_ID || !SANITY_API_TOKEN) {
  console.error(
    "Faltan NEXT_PUBLIC_SANITY_PROJECT_ID y/o SANITY_API_TOKEN.\n" +
      "Corre este script con: node --env-file=.env.local bin/import-a-sanity.mjs"
  );
  process.exit(1);
}

const client = createClient({
  projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-01-01",
  token: SANITY_API_TOKEN,
  useCdn: false,
});

const CATEGORIAS = {
  "bares-counters-podiums": "Bares, Counters y Podiums",
  "buffet-catering": "Buffet y Catering",
  "coolers-hieleras": "Coolers y Hieleras",
  cristaleria: "Cristalería",
  "decoracion-ambientacion": "Decoracion y Ambientacion",
  "manteles-licras": "Manteles y Licras",
  mesas: "Mesas",
  "plantas-potes-decorativos": "Plantas y Potes Decorativos",
  "salas-lounge": "Salas Lounge",
  sillas: "Sillas",
  utileria: "Utileria",
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const DIACRITICS_RANGE = new RegExp("[̀-ͯ]", "g");

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_RANGE, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanTitle(filename) {
  const base = basename(filename, extname(filename));
  const noSize = base.replace(/\s*\d{3,4}x\d{3,4}\s*/g, " ");
  const spaced = noSize.replace(/[_.]+/g, " ").replace(/\s+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const productosDir = fileURLToPath(new URL("../productos", import.meta.url));

let categoriasCreadas = 0;
let productosCreados = 0;
let productosOmitidos = 0;

for (const categoriaSlug of Object.keys(CATEGORIAS)) {
  const categoriaDir = join(productosDir, categoriaSlug);
  let entries;
  try {
    entries = statSync(categoriaDir).isDirectory() ? readdirSync(categoriaDir) : [];
  } catch {
    console.warn(`Carpeta no encontrada, se omite: ${categoriaDir}`);
    continue;
  }

  const categoriaId = `categoria-${categoriaSlug}`;
  const categoriaYaExiste = await client.fetch(`defined(*[_id == $id][0]._id)`, { id: categoriaId });
  await client.createIfNotExists({
    _id: categoriaId,
    _type: "categoriaProducto",
    titulo: CATEGORIAS[categoriaSlug],
    slug: { _type: "slug", current: categoriaSlug },
  });
  if (!categoriaYaExiste) categoriasCreadas++;

  const archivos = entries.filter((f) => IMAGE_EXTENSIONS.has(extname(f).toLowerCase()));

  for (const archivo of archivos) {
    const titulo = cleanTitle(archivo);
    const productoSlug = slugify(titulo) || slugify(archivo);
    const draftId = `drafts.producto-${categoriaSlug}-${productoSlug}`;
    const publishedId = `producto-${categoriaSlug}-${productoSlug}`;

    const yaExiste = await client.fetch(`defined(*[_id == $a || _id == $b][0]._id)`, {
      a: draftId,
      b: publishedId,
    });
    if (yaExiste) {
      productosOmitidos++;
      continue;
    }

    const filePath = join(categoriaDir, archivo);
    const asset = await client.assets.upload("image", readFileSync(filePath), {
      filename: archivo,
    });

    await client.createIfNotExists({
      _id: draftId,
      _type: "producto",
      titulo,
      slug: { _type: "slug", current: productoSlug },
      categoria: { _type: "reference", _ref: categoriaId },
      variantes: [
        {
          _type: "variante",
          imagenes: [{ _type: "image", asset: { _type: "reference", _ref: asset._id } }],
        },
      ],
    });

    productosCreados++;
    console.log(`Creado (borrador): [${categoriaSlug}] ${titulo}`);
  }
}

console.log("\nImportacion terminada.");
console.log(`Categorias creadas: ${categoriasCreadas}`);
console.log(`Productos creados (borrador): ${productosCreados}`);
console.log(`Productos omitidos (ya existian): ${productosOmitidos}`);
console.log("\nRevisa /studio: los productos estan como borrador para que edites titulos,");
console.log("fusiones de variantes de color, medidas/capacidad y descripcion antes de publicar.");
