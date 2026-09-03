import { readdirSync } from "node:fs";
import { extname, join } from "node:path";

/**
 * Fotos para el cintillo de eventos de la home. Lee directo de
 * /public/eventos/<categoria>/ - para agregar mas fotos, solo copia el
 * archivo de imagen dentro de la carpeta correspondiente (mesas, eventos o
 * corporativos), sin tocar codigo. Se recogen en este orden.
 */
export const CATEGORIAS_EVENTOS = ["mesas", "eventos", "corporativos"] as const;

const EXTENSIONES_IMAGEN = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export type FotoEvento = { src: string; alt: string };

function listarFotos(categoria: string): FotoEvento[] {
  const dir = join(process.cwd(), "public", "eventos", categoria);
  try {
    return readdirSync(dir)
      .filter((archivo) => EXTENSIONES_IMAGEN.has(extname(archivo).toLowerCase()))
      .sort()
      .map((archivo) => ({
        src: `/eventos/${categoria}/${archivo}`,
        alt: `Evento de ${categoria} realizado por Alquileres Eventos & Más`,
      }));
  } catch {
    return [];
  }
}

export function obtenerFotosEventos(categorias: readonly string[] = CATEGORIAS_EVENTOS): FotoEvento[] {
  return categorias.flatMap(listarFotos);
}
