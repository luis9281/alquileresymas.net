import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getPost } from "@/lib/sanity/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Blog | Alquileres Eventos & Más" };
  return {
    title: `${post.titulo} | Blog | Alquileres Eventos & Más`,
    description: post.extracto,
    openGraph: post.imagen ? { images: [post.imagen] } : undefined,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const fecha = new Date(post.fecha).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm text-muted">{fecha}</p>
      <h1 className="mt-2">{post.titulo}</h1>

      {post.imagen && (
        <div className="mt-8 aspect-[16/9] overflow-hidden rounded-md bg-border">
          <Image src={post.imagen} alt={post.titulo} width={1200} height={675} className="h-full w-full object-cover" priority />
        </div>
      )}

      <div className="prose prose-neutral mt-8 max-w-none">
        {post.contenido && post.contenido.length > 0 ? (
          <PortableText value={post.contenido} />
        ) : (
          post.extracto && <p>{post.extracto}</p>
        )}
      </div>
    </article>
  );
}
