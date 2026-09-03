import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2025-01-01";

/** Whether a real Sanity project is configured, or we're still on sample data. */
export const sanityConfigured = Boolean(projectId);

export const sanityClient = sanityConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: true })
  : null;

const builder = sanityClient ? createImageUrlBuilder(sanityClient) : null;

export function urlFor(source: Parameters<NonNullable<typeof builder>["image"]>[0]) {
  if (!builder) return null;
  return builder.image(source);
}
