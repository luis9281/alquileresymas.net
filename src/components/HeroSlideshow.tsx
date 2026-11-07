"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { HeroSlide } from "@/lib/hero-slides";

/** matchMedia as a store: false on the server, live value in the browser. */
function useMedia(query: string) {
  return useSyncExternalStore(
    (avisar) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", avisar);
      return () => m.removeEventListener("change", avisar);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

const sinSuscripcion = () => () => {};
function useAhorroDatos() {
  return useSyncExternalStore(
    sinSuscripcion,
    () => (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true,
    () => false
  );
}

export default function HeroSlideshow({
  slides,
  intervalMs = 6000,
}: {
  slides: HeroSlide[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  // The server HTML (and phones) paint the light poster image. Only wide
  // screens without reduced motion or data saver swap in the 1.5 MB video.
  const sinMovimiento = useMedia("(prefers-reduced-motion: reduce)");
  const pantallaAncha = useMedia("(min-width: 768px)");
  const ahorroDatos = useAhorroDatos();
  const conVideo = pantallaAncha && !sinMovimiento && !ahorroDatos;

  useEffect(() => {
    // Reduced motion: no auto-advance; the dots still change slides.
    if (slides.length <= 1 || sinMovimiento) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs, sinMovimiento]);

  if (slides.length === 0) return null;
  const slide = slides[index];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* initial={false}: the first slide is visible in the server HTML instead of fading in after hydration (it is the LCP). */}
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {slide.type === "video" && (conVideo || !slide.poster) ? (
            <video
              src={slide.src}
              poster={slide.poster}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : slide.type === "video" ? (
            <Image src={slide.poster!} alt="" fill sizes="100vw" priority={index === 0} className="object-cover" />
          ) : (
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="100vw"
              priority={index === 0}
              className="object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2">
          {slides.map((_, i) => (
            // The visible dot stays small; the button around it is a 24px touch target.
            <button
              key={i}
              type="button"
              aria-label={`Ir a la diapositiva ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              className="flex h-6 min-w-6 items-center justify-center px-1"
            >
              <span
                className={`block h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-lime" : "w-1.5 bg-white/50"}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
