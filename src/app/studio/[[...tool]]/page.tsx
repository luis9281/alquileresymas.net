"use client";

/**
 * Route that mounts Sanity Studio inside the Next.js app itself, so the
 * client edits products/categories/blog posts at yoursite.com/studio
 * without a separate deployment.
 *
 * Marked "use client": Studio is a fully client-side SPA (routing, live
 * queries via useSWR, etc.), and importing it from a Server Component page
 * drags its dependency graph into the RSC "react-server" module resolution,
 * which several of its transitive deps (e.g. swr) don't support.
 */
import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
