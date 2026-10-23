import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url";
import JsonLd from "@/components/JsonLd";
import { getPost } from "@/lib/sanity/queries";
import { esImagenSanity } from "@/lib/images";
import { urlFor } from "@/lib/sanity/client";

import { SITE_URL } from "@/lib/site-info";
const SITE_TITLE = "Alquileres Eventos & Más";

type Props = { params: Promise<{ slug: string }> };

type ImagenContenido = SanityImageSource & { _key?: string; alt?: string };

// Photos and 2-3 photo galleries placed inside the article body from /studio.
const componentes: PortableTextComponents = {
  types: {
    image: ({ value }: { value: ImagenContenido }) => {
      const src = urlFor(value)?.width(1200).fit("max").auto("format").url();
      if (!src) return null;
      return (
        <figure className="not-prose my-8">
          <Image src={src} alt={value.alt ?? ""} width={1200} height={800} unoptimized className="h-auto w-full rounded-md" />
        </figure>
      );
    },
    galeria: ({ value }: { value: { imagenes?: ImagenContenido[]; leyenda?: string } }) => (
      <figure className="not-prose my-8">
        <div className={`grid grid-cols-2 gap-3 ${value.imagenes?.length === 3 ? "sm:grid-cols-3" : ""}`}>
          {value.imagenes?.map((img, i) => {
            const src = urlFor(img)?.width(600).height(600).fit("crop").auto("format").url();
            return src ? (
              <Image
                key={img._key ?? i}
                src={src}
                alt={img.alt ?? ""}
                width={600}
                height={600}
                unoptimized
                loading="lazy"
                className="aspect-square w-full rounded-md border border-border bg-white object-cover"
              />
            ) : null;
          })}
        </div>
        {value.leyenda && <figcaption className="mt-2 text-center text-sm text-muted">{value.leyenda}</figcaption>}
      </figure>
    ),
  },
};

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
          <PortableText value={post.contenido} components={componentes} />
        ) : (
          post.extracto && <p>{post.extracto}</p>
        )}
      </div>
    </article>
  );
}
