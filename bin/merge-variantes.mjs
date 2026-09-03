/**
 * One-time migration: takes the flat { imagen, color } drafts created by
 * import-a-sanity.mjs (before the "variantes" schema existed) and merges
 * the ones that are really the same physical piece — same base name, just
 * different color photos or different camera angles — into a single
 * producto document with a `variantes` array (one entry per color, each
 * holding one or more photos).
 *
 * This is a best-effort text match, not magic: it strips known angle
 * words ("otro angulo", "lateral frontal", "detras", "medidas") and known
 * color words, groups whatever's left by exact match, and applies two
 * hand-verified aliases for filenames that were inconsistent in the
 * client's own folder (see BASE_ALIASES below). Anything it isn't
 * confident about is left ungrouped and listed in the final report for
 * manual review in /studio.
 *
 * Usage:
 *   node --env-file=.env.local bin/merge-variantes.mjs --dry   (preview only, no writes)
 *   node --env-file=.env.local bin/merge-variantes.mjs         (applies the merge)
 */
import { createClient } from "@sanity/client";

const DRY_RUN = process.argv.includes("--dry");

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
  perspective: "raw", // see draft (unpublished) documents too
});

const ANGLE_WORDS = ["otro angulo", "lateral frontal", "detras", "medidas"];
const COLOR_RE = /\b(Blanc[oa]s?|Chocolate|Dorad[oa]s?|Platead[oa]s?|Transparentes?|Negr[oa]s?)\b/i;

// Hand-verified from the client's original filenames / product line naming
// (not a guess): these titles are the same product as their alias target,
// just inconsistently named in the source folder.
const BASE_ALIASES = {
  "bar elegante": "Bar Elegante Grande",
  "bar elegante grande": "Bar Elegante Grande",
  "tiffany baja": "Silla Tiffany Baja",
};

function stripAngleWords(title) {
  let t = title;
  for (const phrase of ANGLE_WORDS) {
    const re = new RegExp(`[\\s.,-]*${phrase}\\s*$`, "i");
    t = t.replace(re, "");
  }
  return t.trim();
}

function normalizeBase(base) {
  return base
    .replace(/,.*/, "") // drop trailing size specs etc. that followed the color, e.g. ", 16x47''"
    .replace(/\s+/g, " ")
    .replace(/[\s,.-]+$/g, "")
    .replace(/^[\s,.-]+/g, "")
    .trim();
}

/** Collapses dash-vs-space naming inconsistencies so aliases match either style. */
function flatten(text) {
  return text.toLowerCase().replace(/[-,]/g, " ").replace(/\s+/g, " ").trim();
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/** Returns { base, color } extracted from a raw imported title. */
function parseTitle(rawTitle) {
  let title = stripAngleWords(rawTitle);
  title = title.replace(/\btiffanys\b/gi, "Tiffany"); // known typo in source filenames
  title = title.replace(/\s+\d$/, ""); // trailing single-digit numbering artifact, e.g. "Puff LED RGB 1"

  const match = title.match(COLOR_RE);
  let base;
  let color;
  if (match) {
    color = capitalize(match[0]);
    base = normalizeBase(title.slice(0, match.index) + title.slice(match.index + match[0].length));
  } else {
    base = normalizeBase(title);
    color = undefined;
  }

  const alias = BASE_ALIASES[flatten(base)];
  if (alias) base = alias;

  return { base, color };
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const docs = await client.fetch(
  `*[_type == "producto" && !defined(variantes)]{
    _id, titulo, imagen, medidas, capacidad, descripcion,
    "categoriaId": categoria._ref, "categoriaSlug": categoria->slug.current
  } | order(titulo asc)`
);

console.log(`Documentos sin migrar encontrados: ${docs.length}`);
if (docs.length === 0) {
  console.log("Nada que hacer.");
  process.exit(0);
}

// group by categoriaSlug + normalized base
const grupos = new Map();
for (const doc of docs) {
  const { base, color } = parseTitle(doc.titulo);
  const key = `${doc.categoriaSlug}::${base.toLowerCase()}`;
  if (!grupos.has(key)) {
    grupos.set(key, { base, categoriaId: doc.categoriaId, categoriaSlug: doc.categoriaSlug, items: [] });
  }
  grupos.get(key).items.push({ ...doc, color });
}

const tx = client.transaction();
const reporte = [];

for (const { base, categoriaId, categoriaSlug, items } of grupos.values()) {
  // sub-group by color within this base
  const porColor = new Map();
  for (const item of items) {
    const key = (item.color || "").toLowerCase();
    if (!porColor.has(key)) porColor.set(key, { color: item.color, imagenes: [] });
    if (item.imagen) porColor.get(key).imagenes.push(item.imagen);
  }

  const variantes = [...porColor.values()]
    .filter((v) => v.imagenes.length > 0)
    .map((v) => ({
      _key: Math.random().toString(36).slice(2, 10),
      color: v.color,
      imagenes: v.imagenes.map((img) => ({
        _key: Math.random().toString(36).slice(2, 10),
        _type: "image",
        asset: img.asset,
      })),
    }));

  if (variantes.length === 0) continue;

  const medidas = items.find((i) => i.medidas)?.medidas;
  const capacidad = items.find((i) => i.capacidad)?.capacidad;
  const descripcion = items.find((i) => i.descripcion)?.descripcion;

  const slug = slugify(base);
  // Match the source documents' draft/published state so already-published
  // items get fixed in place instead of silently landing in a new draft.
  const idPrefix = items.some((i) => !i._id.startsWith("drafts.")) ? "" : "drafts.";
  const newId = `${idPrefix}producto-${categoriaSlug}-${slug}`;

  if (!DRY_RUN) {
    // createOrReplace (not createIfNotExists): when the computed id
    // collides with one of the source ids (e.g. a single-photo product
    // whose base title needed no stripping), we must overwrite the old
    // flat { imagen, color } shape with the new { variantes } shape, not
    // silently no-op and leave the stale document in place.
    tx.createOrReplace({
      _id: newId,
      _type: "producto",
      titulo: base,
      slug: { _type: "slug", current: slug },
      categoria: { _type: "reference", _ref: categoriaId },
      variantes,
      ...(medidas && { medidas }),
      ...(capacidad && { capacidad }),
      ...(descripcion && { descripcion }),
    });

    for (const item of items) {
      if (item._id !== newId) tx.delete(item._id);
    }
  }

  reporte.push({
    categoria: categoriaSlug,
    titulo: base,
    colores: variantes.map((v) => `${v.color || "(sin color)"} x${v.imagenes.length}`),
    fusionadoDe: items.length,
  });
}

if (!DRY_RUN) {
  await tx.commit();
}

console.log(
  `\n${DRY_RUN ? "[DRY RUN, nada se escribio] " : ""}${reporte.length} productos resultantes (de ${docs.length} originales).\n`
);

let categoriaActual = "";
for (const r of reporte.sort((a, b) => a.categoria.localeCompare(b.categoria) || a.titulo.localeCompare(b.titulo))) {
  if (r.categoria !== categoriaActual) {
    categoriaActual = r.categoria;
    console.log(`\n[${categoriaActual}]`);
  }
  const fusion = r.fusionadoDe > 1 ? ` (fusionado de ${r.fusionadoDe} fotos)` : "";
  console.log(`  - ${r.titulo}: ${r.colores.join(", ")}${fusion}`);
}

console.log(`
Revisa esto con atencion en /studio antes de publicar, en particular:
  - "Bar Elegante Grande": fusione "Bar Elegante - blanco detras" (sin la
    palabra "Grande" en el archivo original) asumiendo que es la misma
    pieza. Verifica que la foto de atras sea del bar blanco correcto.
  - "Silla Tiffany Baja": fusione "Tiffany Transparente Baja" (le faltaba
    la palabra "Silla" en el archivo original) como otra foto del mismo
    color Transparente.

Y estos NO se fusionaron automaticamente por nombres parecidos pero no
identicos — revisa si en realidad son el mismo producto y fusionalos a
mano en /studio si corresponde:
  - "Duo de Mesas decorativas" (Blancas) vs "Mesas Duo de decorativas" (sin color)
  - "Duo de mesa isabelina" (Chocolate) vs "Mesa duo isabelina" (Blanca)
  - "Mesa Nova Delux" (blanca) vs "Mesa Nova Luxe" (Blanca/Chocolate)
  - "Mesa redonda de madera para invitados" blanca vs chocolate con patas
    torneadas (se dejaron separados porque el nombre chocolate menciona
    "patas torneadas" y el blanco no — puede ser una diferencia real de
    construccion, no solo de color)
`);
