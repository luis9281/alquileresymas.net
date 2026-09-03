import { defineField, defineType } from "sanity";

export default defineType({
  name: "categoriaProducto",
  title: "Categoria de producto",
  type: "document",
  fields: [
    defineField({ name: "titulo", title: "Nombre", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "titulo" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "imagen", title: "Imagen de portada", type: "image", options: { hotspot: true } }),
    defineField({
      name: "orden",
      title: "Orden de aparicion",
      description:
        "Controla el orden en la cuadricula 'Explora por categoria' de la pagina principal. El numero mas bajo aparece primero. Dejalo vacio para ordenar alfabeticamente al final.",
      type: "number",
    }),
  ],
  preview: { select: { title: "titulo", subtitle: "orden", media: "imagen" } },
});
