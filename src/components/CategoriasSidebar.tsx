import Link from "next/link";
import type { Categoria } from "@/lib/types";
import { ordenarAlfabeticamente, urlSeleccion, type Subcategoria, type Tipo } from "@/lib/categorias";

/** Last level of the tree (Corrugado, Liso...), nested under its subcategory or group. */
function ListaTipos({ tipos, activo, href }: { tipos: Tipo[]; activo?: string; href: (tipo: string) => string }) {
  if (tipos.length === 0) return null;
  return (
    <ul className="mt-1.5 space-y-1 border-l border-border pl-3">
      {tipos.map((t) => (
        <li key={t.slug}>
          <Link
            href={href(t.slug)}
            aria-current={t.slug === activo ? "page" : undefined}
            className={`flex justify-between gap-2 text-[13px] ${
              t.slug === activo ? "font-semibold text-teal-dark" : "text-muted hover:text-teal"
            }`}
          >
            {t.nombre}
            <span className="text-xs text-muted">{t.cantidad}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function CategoriasSidebar({
  categorias,
  activa,
  subcategorias = [],
  subActiva,
  grupoActivo,
  tipoActivo,
  totalActiva,
}: {
  categorias: Categoria[];
  activa?: string;
  /** Subcategories of the active category, listed under it. */
  subcategorias?: Subcategoria[];
  subActiva?: string;
  /** Optional level under the active subcategory (Redondos > 60"). */
  grupoActivo?: string;
  /** Last level, listed under the active group (or subcategory when it has no groups). */
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
                          aria-current={subEsActiva && !grupoActivo && !tipoActivo ? "page" : undefined}
                          className={`flex justify-between gap-2 text-sm ${
                            subEsActiva ? "font-semibold text-teal-dark" : "text-muted hover:text-teal"
                          }`}
                        >
                          {s.nombre}
                          <span className="text-xs text-muted">{s.cantidad}</span>
                        </Link>
                        {subEsActiva && s.grupos.length > 0 && (
                          <ul className="mt-1.5 space-y-1 border-l border-border pl-3">
                            {s.grupos.map((g) => {
                              const grupoEsActivo = g.slug === grupoActivo;
                              return (
                                <li key={g.slug}>
                                  <Link
                                    href={urlSeleccion(c.slug, s.slug, undefined, g.slug)}
                                    aria-current={grupoEsActivo && !tipoActivo ? "page" : undefined}
                                    className={`flex justify-between gap-2 text-[13px] ${
                                      grupoEsActivo ? "font-semibold text-teal-dark" : "text-muted hover:text-teal"
                                    }`}
                                  >
                                    {g.nombre}
                                    <span className="text-xs text-muted">{g.cantidad}</span>
                                  </Link>
                                  {grupoEsActivo && (
                                    <ListaTipos tipos={g.tipos} activo={tipoActivo} href={(t) => urlSeleccion(c.slug, s.slug, t, g.slug)} />
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                        {subEsActiva && s.grupos.length === 0 && (
                          <ListaTipos tipos={s.tipos} activo={tipoActivo} href={(t) => urlSeleccion(c.slug, s.slug, t)} />
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
