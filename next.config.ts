import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" es para cuando tu mismo alojas el servidor (VPS/Docker,
  // ver DEPLOY.md). Vercel ya empaqueta las funciones a su manera y este
  // modo choca con su build (error ENOENT en next-server.js.nft.json), asi
  // que se desactiva automaticamente cuando el build corre en Vercel.
  output: process.env.VERCEL ? undefined : "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;
