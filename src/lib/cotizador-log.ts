import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Plain-text log of every "Cotizador rápido" request: privado/cotizador-rapido.txt (gitignored).
 * It only works where the server can write to disk (localhost or a Node server). On Vercel the
 * disk is read-only, so there the copy kept in Sanity is the source: npm run exportar:cotizador.
 */
const CARPETA = path.join(process.cwd(), "privado");
const ARCHIVO = path.join(CARPETA, process.env.NODE_ENV === "production" ? "cotizador-rapido.txt" : "cotizador-rapido-dev.txt");

// Panama is UTC-5 all year.
const ahoraPanama = () => new Date(Date.now() - 5 * 3600000).toISOString().slice(0, 16).replace("T", " ");

export async function anotarEnTxt(texto: string): Promise<void> {
  await mkdir(CARPETA, { recursive: true });
  await appendFile(ARCHIVO, `${"=".repeat(60)}\r\n${ahoraPanama()}\r\n${"=".repeat(60)}\r\n${texto.replace(/\r?\n/g, "\r\n")}\r\n\r\n`, "utf8");
}
