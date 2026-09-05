import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import JsonLd from "@/components/JsonLd";
import { getPost } from "@/lib/sanity/queries";
import { esImagenSanity } from "@/lib/images";

const SITE_URL = "https://www.alquileresymas.net";
const SITE_TITLE = "Alquileres Eventos & Más";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Blog | Alquileres Eventos & Más" };
  return {
    title: `${post.titulo} | Blog | Alquileres Eventos & Más`,
    description: post.extracto,
    alternates: { canonical: `/blog/${slug}` },
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

  const postJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.titulo,
    description: post.extracto,
    image: post.imagen ? [post.imagen] : undefined,
    datePublished: post.fecha,
    url: `${SITE_URL}/blog/${slug}`,
    author: { "@type": "Organization", name: SITE_TITLE },
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
  };

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <JsonLd data={postJsonLd} />
      <p className="text-sm text-muted">{fecha}</p>
      <h1 className="mt-2">{post.titulo}</h1>

      {post.imagen && (
        <div className="mt-8 aspect-[16/9] overflow-hidden rounded-md bg-border">
          <Image
            src={post.imagen}
            alt={post.titulo}
            width={1200}
            height={675}
            unoptimized={esImagenSanity(post.imagen)}
            className="h-full w-full object-cover"
            priority
          />
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
