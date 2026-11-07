"use client";

import { MotionConfig } from "framer-motion";

/**
 * With "reduce motion" turned on in the OS, framer-motion skips position and
 * scale movement and keeps only opacity fades, so state changes (menu
 * opening, "Agregado ✓") still read without anything sliding around.
 */
export default function Movimiento({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
