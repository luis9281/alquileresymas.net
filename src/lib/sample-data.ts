/**
 * Fallback content used wherever Sanity has no data yet (fresh project,
 * or env vars not configured). Lets the site render something real during
 * setup instead of empty pages. Sourced from the client's own product
 * photos so the preview looks like the real catalog, not lorem ipsum.
 */
import type { Categoria, Producto, Post } from "./types";

export const categoriasMuestra: Categoria[] = [
  { slug: "bares-counters-podiums", nombre: "Bares, Counters y Podiums" },
  { slug: "buffet-catering", nombre: "Buffet y Catering" },
  { slug: "coolers-hieleras", nombre: "Coolers y Hieleras" },
  { slug: "cristaleria", nombre: "Cristalería" },
  { slug: "decoracion-ambientacion", nombre: "Decoracion y Ambientacion" },
  { slug: "manteles-licras", nombre: "Manteles y Licras" },
  { slug: "mesas", nombre: "Mesas" },
  { slug: "plantas-potes-decorativos", nombre: "Plantas y Potes Decorativos" },
  { slug: "salas-lounge", nombre: "Salas Lounge" },
  { slug: "sillas", nombre: "Sillas" },
  { slug: "utileria", nombre: "Utileria" },
];

function categoria(slug: string): Categoria {
  return categoriasMuestra.find((c) => c.slug === slug)!;
}

export const productosMuestra: Producto[] = [
  {
    _id: "muestra-bar-elegante",
    titulo: "Bar Elegante Grande",
    slug: "bar-elegante-grande",
    categoria: categoria("bares-counters-podiums"),
    variantes: [
      { color: "Blanco", imagenes: ["/muestras/bares-counters-podiums/bar-elegante-blanco.jpg"] },
      { color: "Chocolate", imagenes: ["/muestras/bares-counters-podiums/bar-madera-chocolate.jpg"] },
    ],
  },
  {
    _id: "muestra-mesa-nova-luxe",
    titulo: "Mesa Nova Luxe",
    slug: "mesa-nova-luxe",
    categoria: categoria("mesas"),
    variantes: [{ color: "Blanca", imagenes: ["/muestras/mesas/mesa-nova-luxe-blanca.jpg"] }],
  },
  {
    _id: "muestra-mesa-cubo",
    titulo: "Mesa de un Cubo",
    slug: "mesa-de-un-cubo",
    categoria: categoria("mesas"),
    variantes: [{ color: "Blanca", imagenes: ["/muestras/mesas/mesa-cubo-blanca.jpg"] }],
  },
  {
    _id: "muestra-mesa-redonda-60",
    titulo: "Mesa Redonda 60''",
    slug: "mesa-redonda-60",
    categoria: categoria("mesas"),
    variantes: [{ imagenes: ["/muestras/mesas/mesa-redonda-60.jpg"] }],
    medidas: "60'' diametro",
  },
  {
    _id: "muestra-copa-de-vino",
    titulo: "Copa de Vino",
    slug: "copa-de-vino",
    categoria: categoria("cristaleria"),
    variantes: [{ imagenes: ["/muestras/cristaleria/copa-de-vino.jpg"] }],
  },
  {
    _id: "muestra-puff-led",
    titulo: "Puff LED RGB",
    slug: "puff-led-rgb",
    categoria: categoria("salas-lounge"),
    variantes: [{ imagenes: ["/muestras/salas-lounge/puff-led-rgb.jpg"] }],
  },
  {
    _id: "muestra-crossback",
    titulo: "Silla Crossback",
    slug: "silla-crossback",
    categoria: categoria("sillas"),
    variantes: [{ imagenes: ["/muestras/sillas/crossback.jpg"] }],
  },
  {
    _id: "muestra-tiffany-baja",
    titulo: "Silla Tiffany Baja",
    slug: "silla-tiffany-baja",
    categoria: categoria("sillas"),
    variantes: [{ color: "Dorada", imagenes: ["/muestras/sillas/tiffany-dorada-baja.jpg"] }],
  },
  {
    _id: "muestra-tiffany-coctelera",
    titulo: "Sillas Coctelera Tiffany Altas",
    slug: "sillas-coctelera-tiffany-altas",
    categoria: categoria("sillas"),
    variantes: [{ color: "Dorada", imagenes: ["/muestras/sillas/tiffany-coctelera-dorada.jpg"] }],
  },
];

export const postsMuestra: Post[] = [
  {
    _id: "muestra-post-1",
    titulo: "5 ideas para decorar tu barra de cocteles",
    slug: "ideas-decorar-barra-cocteles",
    extracto:
      "Desde bares de madera hasta counters minimalistas: como elegir el mobiliario correcto para la zona de bebidas de tu evento.",
    fecha: "2026-08-15",
  },
  {
    _id: "muestra-post-2",
    titulo: "Como calcular cuantas mesas y sillas necesitas",
    slug: "calcular-mesas-sillas-evento",
    extracto:
      "Una guia rapida para estimar mobiliario segun numero de invitados y tipo de evento (boda, corporativo, cumpleanos).",
    fecha: "2026-08-02",
  },
  {
    _id: "muestra-post-3",
    titulo: "Tendencias en salas lounge para eventos 2026",
    slug: "tendencias-salas-lounge-2026",
    extracto:
      "Puffs con luces LED, tonos calidos y espacios flexibles: lo que estamos viendo en las fiestas de este ano.",
    fecha: "2026-07-20",
  },
];
