import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/types";
import { truncateWords } from "@/lib/text";
import { esImagenSanity } from "@/lib/images";

export default function BlogCard({ post }: { post: Post }) {
  const fecha = new Date(post.fecha).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="overflow-hidden rounded-md border border-border bg-white">
      <Link href={`/blog/${post.slug}`} className="block aspect-[16/10] overflow-hidden bg-border">
        {post.imagen ? (
          <Image
            src={post.imagen}
            alt={post.titulo}
            width={800}
            height={500}
            unoptimized={esImagenSanity(post.imagen)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-teal/20 to-lime/20" />
        )}
      </Link>
      <div className="p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{fecha}</span>
        <h3 className="mt-2 text-lg font-semibold">
          <Link href={`/blog/${post.slug}`} className="text-teal-dark">
            {post.titulo}
          </Link>
        </h3>
        {post.extracto && (
          <p className="mt-2 text-sm text-muted">{truncateWords(post.extracto, 24)}</p>
        )}
      </div>
    </article>
  );
}
