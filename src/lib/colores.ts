/**
 * Groups variant colors ("Azul navy", "Rojo vino", "Verde olivo"…) into a few
 * families for the catalog color filter, each with a swatch.
 */
export type FamiliaColor = { nombre: string; muestra: string };

// Order matters: the first family whose keyword appears in the color wins
// ("Blanco y negro" -> Estampado, "Rosa viejo" -> Rosa, "Verde aqua" -> Turquesa).
const FAMILIAS: { familia: FamiliaColor; claves: string[] }[] = [
  {
    familia: { nombre: "Estampado", muestra: "repeating-linear-gradient(45deg,#111 0 4px,#fff 4px 8px)" },
    claves: [" y ", "rombo", "navide"],
  },
  { familia: { nombre: "Turquesa", muestra: "#1fb5c9" }, claves: ["turquesa", "aqua"] },
  { familia: { nombre: "Dorado", muestra: "linear-gradient(135deg,#b8862b,#f3d77a,#b8862b)" }, claves: ["dorad"] },
  { familia: { nombre: "Plateado", muestra: "linear-gradient(135deg,#9aa0a6,#eef0f2,#9aa0a6)" }, claves: ["platead"] },
  { familia: { nombre: "Transparente", muestra: "linear-gradient(135deg,#e8f4f8,#fff)" }, claves: ["transparente"] },
  { familia: { nombre: "Chocolate", muestra: "#4a2e1f" }, claves: ["chocolate", "cafe", "madera"] },
  { familia: { nombre: "Crema", muestra: "#efe2c6" }, claves: ["crema", "beige", "marfil"] },
  { familia: { nombre: "Blanco", muestra: "#ffffff" }, claves: ["blanc"] },
  { familia: { nombre: "Negro", muestra: "#111111" }, claves: ["negr"] },
  { familia: { nombre: "Gris", muestra: "#8a8f94" }, claves: ["gris"] },
  { familia: { nombre: "Rosa", muestra: "#f29cc4" }, claves: ["rosa", "rosad", "fucsia", "magenta"] },
  { familia: { nombre: "Rojo", muestra: "#c8102e" }, claves: ["rojo", "roja", "vino", "coral"] },
  { familia: { nombre: "Morado", muestra: "#7b3fa0" }, claves: ["morad", "lila", "violeta", "lavanda"] },
  { familia: { nombre: "Azul", muestra: "#1f4fbf" }, claves: ["azul", "navy", "celeste"] },
  { familia: { nombre: "Verde", muestra: "#2f9e44" }, claves: ["verde", "esmeralda", "olivo"] },
  { familia: { nombre: "Amarillo", muestra: "#f5c518" }, claves: ["amarill"] },
  { familia: { nombre: "Naranja", muestra: "#f57c00" }, claves: ["naranja"] },
];

const normalizar = (s: string) => ` ${s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")} `;

/** Family of a variant color, or null when the variant has no color / no match. */
export function familiaDeColor(color?: string): FamiliaColor | null {
  if (!color) return null;
  const c = normalizar(color);
  return FAMILIAS.find(({ claves }) => claves.some((k) => c.includes(k)))?.familia ?? null;
}

/** Display order of families in the filter (same as the table above). */
export const ORDEN_FAMILIAS = FAMILIAS.map(({ familia }) => familia.nombre);
