"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuote } from "./QuoteContext";
import type { Producto } from "@/lib/types";
import { imagenPrincipal } from "@/lib/producto";

export default function QuoteButton({
  producto,
  colorSeleccionado,
  imagenSeleccionada,
  className,
}: {
  producto: Producto;
  /** Pass the active color when the caller has a variant picker (single product page). */
  colorSeleccionado?: string;
  imagenSeleccionada?: string;
  className?: string;
}) {
  const { addItem, isInQuote } = useQuote();
  const [justAdded, setJustAdded] = useState(false);
  const itemId = colorSeleccionado ? `${producto._id}-${colorSeleccionado}` : producto._id;
  const added = isInQuote(itemId) || justAdded;

  function handleClick() {
    addItem({
      id: itemId,
      title: colorSeleccionado ? `${producto.titulo} (${colorSeleccionado})` : producto.titulo,
      image: imagenSeleccionada ?? imagenPrincipal(producto),
      url: `/catalogo/${producto.categoria.slug}/${producto.slug}`,
    });
    setJustAdded(true);
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      className={
        className ??
        "rounded-md bg-lime px-4 py-2 text-sm font-semibold text-teal-dark hover:bg-lime-dark"
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={added ? "added" : "add"}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className="inline-block"
        >
          {added ? "Agregado ✓" : "Agregar"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
