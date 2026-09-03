/**
 * Publishes every draft document in one go: for each "drafts.<id>", writes
 * its content to the published "<id>" and removes the draft. This is what
 * clicking "Publish" in /studio does per-document, just applied in bulk.
 *
 * Use this after a batch import/merge when you've already reviewed the
 * content and just want it all live — it does NOT re-check quality, so
 * don't run it blindly on content you haven't looked at.
 *
 * Usage: node --env-file=.env.local bin/publish-all-drafts.mjs
 */
import { createClient } from "@sanity/client";

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

const drafts = await client.fetch(`*[_id in path("drafts.**")]`);
console.log(`Borradores encontrados: ${drafts.length}`);

if (drafts.length === 0) {
  console.log("Nada que publicar.");
  process.exit(0);
}

const tx = client.transaction();
for (const doc of drafts) {
  const publishedId = doc._id.replace(/^drafts\./, "");
  const { _id, _rev, _system, ...rest } = doc;
  tx.createOrReplace({ _id: publishedId, ...rest });
  tx.delete(doc._id);
}

await tx.commit();

const porTipo = drafts.reduce((acc, d) => {
  acc[d._type] = (acc[d._type] || 0) + 1;
  return acc;
}, {});
console.log("Publicado:", porTipo);
