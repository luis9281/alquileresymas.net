"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import HeroSlideshow from "./HeroSlideshow";
import { heroSlides } from "@/lib/hero-slides";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-teal-dark px-6 py-28 text-white">
      <HeroSlideshow slides={heroSlides} />
      <div className="absolute inset-0 bg-gradient-to-r from-teal-dark/90 via-teal-dark/70 to-teal-dark/40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto max-w-2xl"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-lime">
          Renta de mobiliario y equipo para eventos
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
          Eventos memorables, sin complicaciones
        </h1>
        <p className="mt-5 text-lg text-white/85">
          Bares, mesas, sillas, decoración y mucho más. Arma tu evento y solicita tu cotización en minutos.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/catalogo" className="rounded-md bg-lime px-6 py-3 font-semibold text-teal-dark hover:bg-lime-dark">
            Ver catálogo
          </Link>
          <Link
            href="/cotizacion"
            className="rounded-md border-2 border-white px-6 py-3 font-semibold text-white hover:bg-white/10"
          >
            Solicitar cotización
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
