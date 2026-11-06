import { defineField, defineType } from "sanity";

/**
 * Read-only Studio views of the data the website writes on its own:
 * the sales split counters (src/lib/reparto.ts) and the quote request log (src/lib/solicitudes-log.ts).
 * Nobody edits these by hand; the counters decide who gets the next request.
 */

// Counter keys as reparto.ts stores them ("ventas1@alquileresymas.net" -> "ventas1_alquileresymas_net").
const VENDEDORES = ["ventas", "ventas1", "ventas2", "ventas3"];

export const repartoCorreos = defineType({
  name: "repartoCorreos",
  title: "Contadores del reparto",
  type: "document",
  readOnly: true,
  fields: [
    defineField({
      name: "conteos",
      title: "Solicitudes recibidas por cada vendedor",
      description: "A la siguiente solicitud le toca al que tenga menos (empate al azar). Gerencia recibe copia de todas.",
      type: "object",
      fields: VENDEDORES.map((v) =>
        defineField({ name: `${v}_alquileresymas_net`, title: `${v}@alquileresymas.net`, type: "number" })
      ),
    }),
    defineField({
      name: "ultimo",
      title: "Ultima asignacion",
      type: "object",
      fields: [
        defineField({ name: "email", title: "Vendedor", type: "string" }),
        defineField({ name: "fecha", title: "Fecha", type: "datetime" }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Contadores del reparto" }) },
});

export const solicitudCotizacion = defineType({
  name: "solicitudCotizacion",
  title: "Solicitud de cotizacion",
  type: "document",
  readOnly: true,
  fields: [
    defineField({ name: "fecha", title: "Recibida", type: "datetime" }),
    defineField({ name: "asignadoA", title: "Asignada a", type: "string" }),
    defineField({ name: "nombre", title: "Cliente", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "telefono", title: "Telefono", type: "string" }),
    defineField({ name: "fechaEvento", title: "Fecha del evento", type: "string" }),
    defineField({ name: "lugar", title: "Lugar", type: "string" }),
    defineField({ name: "productos", title: "Productos", type: "text", rows: 3 }),
    defineField({ name: "origen", title: "Formulario", description: "Vacio = formulario de Cotizacion.", type: "string" }),
    defineField({ name: "detalle", title: "Detalle de la cotizacion", type: "text", rows: 10 }),
  ],
  orderings: [{ title: "Mas recientes", name: "fechaDesc", by: [{ field: "fecha", direction: "desc" }] }],
  preview: {
    select: { nombre: "nombre", asignadoA: "asignadoA", fecha: "fecha" },
    prepare: ({ nombre, asignadoA, fecha }) => ({
      title: nombre || "(sin nombre)",
      subtitle: [asignadoA?.split("@")[0], fecha && new Date(fecha).toLocaleString("es-PA", { timeZone: "America/Panama" })]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});

export { VENDEDORES };
