/**
 * Slides for the homepage hero.
 *
 * The event photos/video in /public/eventos are free stock samples (Pexels
 * License — free for commercial use) used as placeholders. Swap them for
 * the client's real event photography/video whenever it's available:
 * 1. Drop the licensed file into /public/eventos (anything in /public is
 *    served as-is by Next.js).
 * 2. Point an entry below at "/eventos/tu-archivo.mp4" (type: "video") or
 *    "/eventos/tu-foto.jpg" (type: "image"), or just replace the existing
 *    sample file at the same path.
 */

export type HeroSlide =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string; poster?: string };

export const heroSlides: HeroSlide[] = [
  {
    type: "video",
    src: "/eventos/decoracion-evento-video.mp4",
    poster: "/eventos/decoracion-evento-1.jpg",
  },
  {
    type: "image",
    src: "/eventos/sillas-tiffany-evento.jpg",
    alt: "Sillas Tiffany transparentes en un evento",
  },
  {
    type: "video",
    src: "/eventos/12423709_1920_1080_25fps.mp4",
  },
  {
    type: "image",
    src: "/eventos/salon-sillas-tiffany-1.jpg",
    alt: "Salón amplio montado con mesas redondas y sillas Tiffany",
  },
  {
    type: "image",
    src: "/eventos/evento-corporativo-2.jpg",
    alt: "Salón de evento corporativo con mesas redondas y sillas",
  },
];
