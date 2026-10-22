import Link from "next/link";
import type { Categoria } from "@/lib/types";
import { ordenarAlfabeticamente, urlSeleccion, type Subcategoria } from "@/lib/categorias";

export default function CategoriasSidebar({
  categorias,
  activa,
  subcategorias = [],
  subActiva,
  tipoActivo,
  totalActiva,
}: {
  categorias: Categoria[];
  activa?: string;
  /** Subcategories of the active category, listed under it. */
  subcategorias?: Subcategoria[];
  subActiva?: string;
  /** Third level, listed under the active subcategory. */
  tipoActivo?: string;
  /** Card count of the whole active category (sum of its subcategories plus ungrouped products). */
  totalActiva?: number;
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
                {esActiva && totalActiva !== undefined && (
                  <span className="ml-2 text-xs font-normal text-muted no-underline">{totalActiva}</span>
                )}
              </Link>
              {esActiva && subcategorias.length > 0 && (
                <ul className="mt-2 space-y-1.5 border-l border-border pl-3">
                  {subcategorias.map((s) => {
                    const subEsActiva = s.slug === subActiva;
                    return (
                      <li key={s.slug}>
                        <Link
                          href={urlSeleccion(c.slug, s.slug)}
                          aria-current={subEsActiva && !tipoActivo ? "page" : undefined}
                          className={`flex justify-between gap-2 text-sm ${
                            subEsActiva ? "font-semibold text-teal-dark" : "text-muted hover:text-teal"
                          }`}
                        >
                          {s.nombre}
                          <span className="text-xs text-muted">{s.cantidad}</span>
                        </Link>
                        {subEsActiva && s.tipos.length > 0 && (
                          <ul className="mt-1.5 space-y-1 border-l border-border pl-3">
                            {s.tipos.map((t) => (
                              <li key={t.slug}>
                                <Link
                                  href={urlSeleccion(c.slug, s.slug, t.slug)}
                                  aria-current={t.slug === tipoActivo ? "page" : undefined}
                                  className={`flex justify-between gap-2 text-[13px] ${
                                    t.slug === tipoActivo ? "font-semibold text-teal-dark" : "text-muted hover:text-teal"
                                  }`}
                                >
                                  {t.nombre}
                                  <span className="text-xs text-muted">{t.cantidad}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
