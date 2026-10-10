import Link from "next/link";
import type { Categoria } from "@/lib/types";
import { ordenarAlfabeticamente } from "@/lib/categorias";

export default function CategoriasSidebar({
  categorias,
  activa,
}: {
  categorias: Categoria[];
  activa?: string;
}) {
  return (
    <aside>
      <h2 className="mb-4 text-lg">Categorías</h2>
      <ul className="space-y-2">
        {ordenarAlfabeticamente(categorias).map((c) => (
          <li key={c.slug}>
            <Link
              href={`/catalogo/${c.slug}`}
              className={c.slug === activa ? "font-bold text-lime-dark" : "text-ink hover:text-teal"}
            >
              {c.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
