import { defineArrayMember, defineField, defineType } from "sanity";

// Photos inside the article: the alt text is what Google and screen readers read.
const imagenConAlt = defineArrayMember({
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Texto alternativo",
      description: "Describe la foto en pocas palabras (ej. Servilleta de tela azul navy doblada).",
      type: "string",
    }),
  ],
});

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
    defineField({
      name: "contenido",
      title: "Contenido",
      type: "array",
      of: [
        { type: "block" },
        imagenConAlt,
        defineArrayMember({
          name: "galeria",
          title: "Galeria (2-3 fotos lado a lado)",
          type: "object",
          fields: [
            defineField({
              name: "imagenes",
              title: "Fotos",
              type: "array",
              of: [imagenConAlt],
              validation: (r) => r.required().min(2).max(3),
            }),
            defineField({ name: "leyenda", title: "Pie de foto", type: "string" }),
          ],
          preview: {
            select: { title: "leyenda", media: "imagenes.0" },
            prepare: ({ title, media }) => ({ title: title || "Galeria", media }),
          },
        }),
      ],
    }),
  ],
  preview: { select: { title: "titulo", media: "imagen" } },
});
