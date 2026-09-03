import { defineField, defineType } from "sanity";

export default defineType({
  name: "producto",
  title: "Producto",
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
    defineField({
      name: "categoria",
      title: "Categoria",
      type: "reference",
      to: [{ type: "categoriaProducto" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "variantes",
      title: "Variantes (color / acabado)",
      description:
        "Un producto con un solo color: agrega una variante. Un producto que viene en varios colores (ej. Blanco y Chocolate): agrega una variante por color, cada una con sus propias fotos.",
      type: "array",
      validation: (r) => r.required().min(1),
      of: [
        defineField({
          name: "variante",
          title: "Variante",
          type: "object",
          fields: [
            defineField({
              name: "color",
              title: "Color / acabado",
              type: "string",
              description: "Deja vacio si el producto no tiene variantes de color.",
            }),
            defineField({
              name: "imagenes",
              title: "Fotos",
              type: "array",
              validation: (r) => r.required().min(1),
              of: [defineField({ name: "imagen", type: "image", options: { hotspot: true } })],
            }),
          ],
          preview: {
            select: { title: "color", media: "imagenes.0" },
            prepare({ title, media }) {
              return { title: title || "Sin color especificado", media };
            },
          },
        }),
      ],
    }),
    defineField({ name: "medidas", title: "Medidas", type: "string" }),
    defineField({ name: "capacidad", title: "Capacidad / puestos", type: "string" }),
    defineField({
      name: "precio",
      title: "Precio",
      description: "Precio de referencia (por dia de renta). Dejalo vacio si prefieres manejar todo por cotizacion.",
      type: "number",
      validation: (r) => r.min(0),
    }),
    defineField({ name: "descripcion", title: "Descripcion", type: "text" }),
  ],
  preview: {
    select: { title: "titulo", subtitle: "categoria.titulo", media: "variantes.0.imagenes.0" },
  },
});
