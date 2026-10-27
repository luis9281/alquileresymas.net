import { formatoPrecio } from "./precio";

/** Shared rules of the "Cotizador rápido" page: tax, delivery zones and line math. */

/** ITBMS de Panamá: 7 %. */
export const ITBMS = 0.07;

export type ZonaTransporte = {
  id: string;
  nombre: string;
  /** null = el costo se confirma al revisar la dirección. */
  costo: number | null;
  /** Words in the delivery address that suggest this zone (accent-free, lowercase). */
  claves: string[];
};

// TODO(precios): tarifas de ejemplo — confirmar con gerencia antes de publicar.
export const ZONAS_TRANSPORTE: ZonaTransporte[] = [
  {
    id: "ciudad",
    nombre: "Ciudad de Panamá",
    costo: 35,
    claves: [
      "ciudad de panama", "san francisco", "bella vista", "obarrio", "el cangrejo", "costa del este",
      "punta pacifica", "punta paitilla", "paitilla", "betania", "el dorado", "clayton", "albrook",
      "ancon", "casco", "juan diaz", "parque lefevre", "rio abajo", "pueblo nuevo", "santa maria",
      "via espana", "via israel", "domingo diaz", "calidonia", "marbella", "condado del rey",
    ],
  },
  {
    id: "norte-este",
    nombre: "San Miguelito, Panamá Norte y Este",
    costo: 50,
    claves: [
      "san miguelito", "los andes", "brisas del golf", "cerro viento", "villa lucre", "las cumbres",
      "chilibre", "tocumen", "pacora", "24 de diciembre", "las mananitas", "chepo", "nuevo tocumen",
    ],
  },
  {
    id: "oeste",
    nombre: "Panamá Oeste (Arraiján, La Chorrera)",
    costo: 65,
    claves: ["arraijan", "chorrera", "vista alegre", "costa verde", "panama pacifico", "playa dorada", "veracruz", "nuevo chorrillo", "burunga"],
  },
  {
    id: "playas-colon",
    nombre: "Playas, Colón y otras provincias",
    costo: null,
    claves: [
      "colon", "coronado", "san carlos", "chame", "gorgona", "rio hato", "farallon", "buenaventura",
      "anton", "penonome", "cocle", "chiriqui", "david", "bocas", "herrera", "los santos", "veraguas", "pedasi",
    ],
  },
];

const sinAcentos = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Best-guess zone for a free-text address; undefined when nothing matches. */
export function zonaSugerida(direccion: string): ZonaTransporte | undefined {
  const d = sinAcentos(direccion);
  if (!d.trim()) return undefined;
  // Outer zones first, so "Costa Verde, La Chorrera" isn't taken for the city.
  return [...ZONAS_TRANSPORTE].reverse().find((z) => z.claves.some((c) => d.includes(c)));
}

export type LineaCotizacion = {
  id: string;
  titulo: string;
  qty: number;
  /** undefined = producto sin precio publicado (se cotiza aparte). */
  precio?: number;
};

export type Totales = {
  subtotal: number;
  transporte: number;
  itbms: number;
  total: number;
  /** Lines or delivery that still need a price from the team. */
  pendientes: boolean;
};

const redondear = (n: number) => Math.round(n * 100) / 100;

export function calcularTotales(lineas: LineaCotizacion[], transporte: number | null | undefined): Totales {
  const subtotal = redondear(lineas.reduce((s, l) => s + (l.precio ?? 0) * l.qty, 0));
  const flete = transporte ?? 0;
  const itbms = redondear((subtotal + flete) * ITBMS);
  return {
    subtotal,
    transporte: flete,
    itbms,
    total: redondear(subtotal + flete + itbms),
    pendientes: lineas.some((l) => l.precio === undefined) || transporte === null,
  };
}

export const AVISO_DISPONIBILIDAD = "Cotización sujeta a verificación de disponibilidad.";
export const AVISO_TRANSPORTE =
  "El transporte es un estimado: varía según la cantidad de artículos y la distancia. No es el precio final.";

export type CotizacionRapida = {
  empresa: string;
  email: string;
  whatsapp: string;
  direccion: string;
  mapsUrl: string;
  /** yyyy-mm-dd */
  desde: string;
  hasta: string;
  observaciones: string;
  /** "" = el cliente retira en el local. */
  zonaId: string;
  lineas: LineaCotizacion[];
};

function fecha(iso: string): string {
  const [a, m, d] = iso.split("-");
  return a && m && d ? `${d}/${m}/${a}` : iso;
}

/** Plain-text quote, shared by the WhatsApp message and the email. `negrita` wraps labels (WhatsApp uses *). */
export function textoCotizacion(c: CotizacionRapida, negrita = (t: string) => t): string {
  const zona = ZONAS_TRANSPORTE.find((z) => z.id === c.zonaId);
  const t = calcularTotales(c.lineas, zona ? zona.costo : 0);
  const campo = (label: string, valor: string) => (valor ? [`${negrita(`${label}:`)} ${valor}`] : []);

  const lineas = [
    "Hola, quiero solicitar esta cotización:",
    "",
    ...campo("Empresa / cliente", c.empresa),
    ...campo("Correo", c.email),
    ...campo("WhatsApp", c.whatsapp),
    ...campo("Fecha del evento", c.desde ? (c.hasta && c.hasta !== c.desde ? `${fecha(c.desde)} al ${fecha(c.hasta)}` : fecha(c.desde)) : ""),
    ...campo("Dirección de entrega", c.direccion),
    ...campo("Ubicación en Google Maps", c.mapsUrl),
    "",
    negrita("Productos:"),
    ...c.lineas.map((l) =>
      l.precio === undefined
        ? `- ${l.titulo} x${l.qty} (precio por confirmar)`
        : `- ${l.titulo} x${l.qty} @ ${formatoPrecio(l.precio)} = ${formatoPrecio(l.precio * l.qty)}`
    ),
    "",
    `Subtotal: ${formatoPrecio(t.subtotal)}`,
    `Transporte: ${zona ? (zona.costo === null ? `por confirmar (${zona.nombre})` : `${formatoPrecio(zona.costo)} (${zona.nombre})`) : "retiro en local"}`,
    `ITBMS (7%): ${formatoPrecio(t.itbms)}`,
    `${negrita("Total estimado:")} ${formatoPrecio(t.total)}${t.pendientes ? " + montos por confirmar" : ""}`,
    ...(c.observaciones ? ["", negrita("Observaciones:"), c.observaciones] : []),
    "",
    `⚠️ ${AVISO_DISPONIBILIDAD}`,
    ...(zona ? [`⚠️ ${AVISO_TRANSPORTE}`] : []),
  ];
  return lineas.join("\n");
}
