const SANITY_CDN_PREFIX = "https://cdn.sanity.io/";

/**
 * Sanity's CDN already serves these resized, auto-formatted (see `urlFor(...).auto("format")`)
 * with a 1-year Cache-Control header. Routing them through Next's own Image Optimization API
 * would mean Vercel re-fetches, re-encodes and re-serves bytes it doesn't need to — pass this
 * to the `unoptimized` prop so the browser loads them straight from Sanity's CDN instead.
 */
export function esImagenSanity(src?: string): boolean {
  return typeof src === "string" && src.startsWith(SANITY_CDN_PREFIX);
}
