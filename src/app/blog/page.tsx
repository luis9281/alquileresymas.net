import type { Metadata } from "next";
import BlogCard from "@/components/BlogCard";
import { getPosts } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Blog | Alquileres Eventos & Más",
  description: "Ideas, tendencias y consejos para planear bodas, eventos corporativos y celebraciones sociales en Panamá.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <section className="bg-teal-dark px-6 py-16 text-white">
        <div className="mx-auto max-w-[1350px]">
          <h1 className="text-white">Blog</h1>
          <p className="mt-2 max-w-xl text-white/80">Ideas, tendencias y consejos para tus eventos.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1350px] px-6 py-16">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-muted">Aún no hay artículos publicados.</p>
        )}
      </section>
    </>
  );
}
