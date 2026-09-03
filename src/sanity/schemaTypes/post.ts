import { defineField, defineType } from "sanity";

export default defineType({
  name: "post",
  title: "Entrada de blog",
  type: "document",
  fields: [
    defineField({ name: "titulo", title: "Titulo", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "titulo" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "imagen", title: "Imagen de portada", type: "image", options: { hotspot: true } }),
    defineField({ name: "extracto", title: "Resumen corto", type: "text", rows: 3 }),
    defineField({
      name: "fecha",
      title: "Fecha de publicacion",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({ name: "contenido", title: "Contenido", type: "array", of: [{ type: "block" }, { type: "image" }] }),
  ],
  preview: { select: { title: "titulo", media: "imagen" } },
});
