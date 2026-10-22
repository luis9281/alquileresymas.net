import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2025-01-01";

/** Whether a real Sanity project is configured, or we're still on sample data. */
export const sanityConfigured = Boolean(projectId);

// To review unpublished drafts locally before publishing them:
// MOSTRAR_BORRADORES=1 npm run dev (needs SANITY_API_TOKEN; never set on Vercel).
const mostrarBorradores = process.env.MOSTRAR_BORRADORES === "1" && Boolean(process.env.SANITY_API_TOKEN);

export const sanityClient = sanityConfigured
  ? createClient(
      mostrarBorradores
        ? { projectId, dataset, apiVersion, useCdn: false, token: process.env.SANITY_API_TOKEN, perspective: "drafts" }
        : { projectId, dataset, apiVersion, useCdn: true }
    )
  : null;

const builder = sanityClient ? createImageUrlBuilder(sanityClient) : null;

export function urlFor(source: Parameters<NonNullable<typeof builder>["image"]>[0]) {
  if (!builder) return null;
  return builder.image(source);
}
