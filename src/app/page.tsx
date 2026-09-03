import Hero from "@/components/Hero";
import EventosRibbon from "@/components/EventosRibbon";
import CategoryCard from "@/components/CategoryCard";
import CategoryShowcase from "@/components/CategoryShowcase";
import ServiciosSection from "@/components/ServiciosSection";
import BlogCard from "@/components/BlogCard";
import RevealOnScroll from "@/components/RevealOnScroll";
import { getCategorias, getProductos, getPosts } from "@/lib/sanity/queries";
import { imagenPrincipal } from "@/lib/producto";

export default async function HomePage() {
  const [categorias, productos, posts] = await Promise.all([
    getCategorias(),
    getProductos(),
    getPosts(),
  ]);

  const sillas = productos.filter((p) => p.categoria.slug === "sillas");
  const mesas = productos.filter((p) => p.categoria.slug === "mesas");
  const cristaleria = productos.filter((p) => p.categoria.slug === "cristaleria");

  // Portada por categoría: la del CMS si el cliente la subió, si no la del
  // primer producto real de esa categoría (mejor que el logo genérico).
  const imagenPorCategoria = new Map<string, string>();
  for (const p of productos) {
    if (imagenPorCategoria.has(p.categoria.slug)) continue;
    const imagen = imagenPrincipal(p);
    if (imagen) imagenPorCategoria.set(p.categoria.slug, imagen);
  }

  const postsRecientes = posts.slice(0, 3);
  // En esta vitrina van todas las sillas, pero primero Crossback y las
  // Tiffany (más fotogénicas), y después el resto en su orden habitual.
  const prioridadSilla = (p: (typeof sillas)[number]) =>
    p.titulo === "Crossback" || p.titulo.toLowerCase().includes("tiffany") ? 0 : 1;
  const sillasDestacadas = [...sillas].sort((a, b) => prioridadSilla(a) - prioridadSilla(b));

  // "Decoracion y Ambientacion" no se muestra en esta cuadrícula por ahora
  // (sigue existiendo en Sanity y en /catalogo, solo se oculta aquí).
  // El orden de las demás lo controla el campo "orden" de cada categoría en Sanity.
  const categoriasVisibles = categorias.filter((c) => c.slug !== "decoracion-ambientacion");

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-[1350px] px-6 py-20">
        <RevealOnScroll>
          <h2 className="mb-9 text-3xl">Explora por categoría</h2>
        </RevealOnScroll>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {categoriasVisibles.map((c, i) => (
            <RevealOnScroll key={c.slug} delay={i * 0.04}>
              <CategoryCard categoria={c} imagen={c.imagen ?? imagenPorCategoria.get(c.slug)} />
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <RevealOnScroll>
        <CategoryShowcase
          eyebrow="Nuestra colección"
          titulo="Sillas para cada estilo de evento"
          copy={`Del clásico Tiffany dorado al minimalismo transparente del Phoenix: ${sillas.length}+ modelos para bodas, eventos corporativos y celebraciones íntimas, en la cantidad que necesites.`}
          verTodoHref="/catalogo/sillas"
          productos={sillasDestacadas}
        />
      </RevealOnScroll>

      <RevealOnScroll>
        <CategoryShowcase
          eyebrow="Nuestra colección"
          titulo="Mesas para cada montaje"
          copy={`Redondas, rectangulares, cocteleras o decorativas, en blanco y chocolate: ${mesas.length}+ mesas para armar el layout perfecto de tu evento.`}
          verTodoHref="/catalogo/mesas"
          productos={mesas}
        />
      </RevealOnScroll>

      <RevealOnScroll>
        <CategoryShowcase
          eyebrow="Nuestra colección"
          titulo="Cristalería para cada brindis"
          copy={`Copas de vino, champaña, martini y más, hasta vasos y tazas: ${cristaleria.length}+ piezas para que cada bebida se sirva a la altura de tu evento.`}
          verTodoHref="/catalogo/cristaleria"
          productos={cristaleria}
        />
      </RevealOnScroll>

      <RevealOnScroll>
        <ServiciosSection />
      </RevealOnScroll>

      {postsRecientes.length > 0 && (
        <section className="mx-auto max-w-[1350px] px-6 py-20">
          <RevealOnScroll className="mb-9 flex items-baseline justify-between">
            <h2 className="text-3xl">Del blog</h2>
          </RevealOnScroll>
          <div className="grid gap-7 sm:grid-cols-3">
            {postsRecientes.map((post, i) => (
              <RevealOnScroll key={post._id} delay={i * 0.06}>
                <BlogCard post={post} />
              </RevealOnScroll>
            ))}
          </div>
        </section>
      )}

      <EventosRibbon
        categorias={["corporativos"]}
        eyebrow="Eventos corporativos"
        titulo="También montamos tu próxima conferencia o gala"
        ctaHref="/cotizacion"
        ctaLabel="Cotizar evento corporativo"
      />
    </>
  );
}
