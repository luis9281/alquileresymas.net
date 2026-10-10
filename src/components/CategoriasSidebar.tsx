import Link from "next/link";
import type { Categoria } from "@/lib/types";
import { ordenarAlfabeticamente, type Subcategoria } from "@/lib/categorias";

export default function CategoriasSidebar({
  categorias,
  activa,
  subcategorias = [],
  subActiva,
}: {
  categorias: Categoria[];
  activa?: string;
  /** Subcategories of the active category, listed under it. */
  subcategorias?: Subcategoria[];
  subActiva?: string;
}) {
  return (
    <aside>
      <h2 className="mb-4 text-lg">Categorías</h2>
      <ul className="space-y-2">
        {ordenarAlfabeticamente(categorias).map((c) => {
          const esActiva = c.slug === activa;
          return (
            <li key={c.slug}>
              <Link
                href={`/catalogo/${c.slug}`}
                aria-current={esActiva && !subActiva ? "page" : undefined}
                className={
                  esActiva
                    ? "font-bold text-teal-dark underline decoration-lime decoration-2 underline-offset-4"
                    : "text-ink hover:text-teal"
                }
              >
                {c.nombre}
              </Link>
              {esActiva && subcategorias.length > 0 && (
                <ul className="mt-2 space-y-1.5 border-l border-border pl-3">
                  {subcategorias.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/catalogo/${c.slug}?sub=${s.slug}`}
                        aria-current={s.slug === subActiva ? "page" : undefined}
                        className={`flex justify-between gap-2 text-sm ${
                          s.slug === subActiva ? "font-semibold text-teal-dark" : "text-muted hover:text-teal"
                        }`}
                      >
                        {s.nombre}
                        <span className="text-xs text-muted">{s.cantidad}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
