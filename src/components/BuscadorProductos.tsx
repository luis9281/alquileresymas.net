"use client";

import { useId, useState } from "react";

export const MIN_CARACTERES_BUSQUEDA = 3;
const MAX_SUGERENCIAS = 8;

/** Lowercase, accent-free text so "cristaleria" matches "Cristalería". */
export function normalizar(texto: string): string {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Names containing the query; names that start with it come first. */
function sugerenciasPara(consulta: string, nombres: string[]): string[] {
  const q = normalizar(consulta.trim());
  if (q.length < MIN_CARACTERES_BUSQUEDA) return [];
  const coincidencias = [...new Set(nombres)].filter((n) => normalizar(n).includes(q));
  const empiezaCon = (n: string) => (normalizar(n).startsWith(q) ? 0 : 1);
  return coincidencias
    .sort((a, b) => empiezaCon(a) - empiezaCon(b) || a.localeCompare(b, "es"))
    .slice(0, MAX_SUGERENCIAS);
}

// Bolds the matched part. Accent stripping keeps string length for Spanish
// text (one base letter + one combining mark → one letter), so indexes line up.
function Resaltado({ texto, consulta }: { texto: string; consulta: string }) {
  const i = normalizar(texto).indexOf(normalizar(consulta.trim()));
  if (i < 0) return <>{texto}</>;
  const fin = i + consulta.trim().length;
  return (
    <>
      {texto.slice(0, i)}
      <strong className="font-semibold text-teal-dark">{texto.slice(i, fin)}</strong>
      {texto.slice(fin)}
    </>
  );
}

export default function BuscadorProductos({
  valor,
  onChange,
  nombres,
}: {
  valor: string;
  onChange: (valor: string) => void;
  nombres: string[];
}) {
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const listaId = useId();
  const sugerencias = sugerenciasPara(valor, nombres);
  const mostrarLista = abierto && sugerencias.length > 0;

  const elegir = (nombre: string) => {
    onChange(nombre);
    setAbierto(false);
    setActivo(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && sugerencias.length) {
      e.preventDefault();
      setAbierto(true);
      setActivo((i) => (i + 1) % sugerencias.length);
    } else if (e.key === "ArrowUp" && sugerencias.length) {
      e.preventDefault();
      setActivo((i) => (i <= 0 ? sugerencias.length - 1 : i - 1));
    } else if (e.key === "Enter" && mostrarLista && activo >= 0) {
      e.preventDefault();
      elegir(sugerencias[activo]);
    } else if (e.key === "Escape") {
      if (mostrarLista) setAbierto(false);
      else onChange("");
    }
  };

  return (
    <div className="relative w-full sm:max-w-xs sm:flex-1">
      <label htmlFor={`${listaId}-input`} className="mb-1 block text-sm text-muted">
        Buscar por nombre
      </label>
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          id={`${listaId}-input`}
          type="search"
          role="combobox"
          aria-expanded={mostrarLista}
          aria-controls={listaId}
          aria-autocomplete="list"
          aria-activedescendant={mostrarLista && activo >= 0 ? `${listaId}-${activo}` : undefined}
          autoComplete="off"
          value={valor}
          placeholder="Ej. mesa, tiffany, copa…"
          onChange={(e) => {
            onChange(e.target.value);
            setAbierto(true);
            setActivo(-1);
          }}
          onFocus={() => setAbierto(true)}
          onBlur={() => setAbierto(false)}
          onKeyDown={onKeyDown}
          className="w-full rounded-md border border-border bg-white py-2 pl-9 pr-3 text-sm text-ink"
        />
      </div>
      {mostrarLista && (
        <ul
          id={listaId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-md border border-border bg-white py-1 shadow-lg"
        >
          {sugerencias.map((nombre, i) => (
            <li
              key={nombre}
              id={`${listaId}-${i}`}
              role="option"
              aria-selected={i === activo}
              // mousedown (not click) so it fires before the input's blur closes the list.
              onMouseDown={(e) => {
                e.preventDefault();
                elegir(nombre);
              }}
              onMouseEnter={() => setActivo(i)}
              className={`cursor-pointer px-3 py-2 text-sm text-ink ${i === activo ? "bg-teal/10" : ""}`}
            >
              <Resaltado texto={nombre} consulta={valor} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
