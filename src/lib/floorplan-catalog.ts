export type FormaItem = "circulo" | "rectangulo";

export type TipoItem =
  | "mesa-redonda-6"
  | "mesa-redonda-8"
  | "mesa-redonda-10"
  | "mesa-rectangular-6"
  | "mesa-rectangular-8"
  | "mesa-cocktail"
  | "mesa-buffet"
  | "tarima"
  | "pista-baile"
  | "bar"
  | "dj"
  | "silla";

export type CategoriaItem = "mesas" | "sillas" | "espacios";

export type DefinicionItem = {
  tipo: TipoItem;
  etiqueta: string;
  categoria: CategoriaItem;
  forma: FormaItem;
  /** Diametro (circulo) o ancho (rectangulo), en metros. */
  anchoM: number;
  /** Igual al ancho en circulos; profundidad en rectangulos, en metros. */
  largoM: number;
  asientos: number;
  color: string;
};

// Medidas basadas en mobiliario real de renta de eventos (mesas redondas de
// 60"/72", mesas rectangulares de 6'/8', tarima y pista de baile estandar).
export const CATALOGO_ITEMS: DefinicionItem[] = [
  { tipo: "mesa-redonda-6", etiqueta: "Mesa redonda (6)", categoria: "mesas", forma: "circulo", anchoM: 1.2, largoM: 1.2, asientos: 6, color: "#2c6577" },
  { tipo: "mesa-redonda-8", etiqueta: "Mesa redonda (8)", categoria: "mesas", forma: "circulo", anchoM: 1.5, largoM: 1.5, asientos: 8, color: "#2c6577" },
  { tipo: "mesa-redonda-10", etiqueta: "Mesa redonda (10)", categoria: "mesas", forma: "circulo", anchoM: 1.8, largoM: 1.8, asientos: 10, color: "#2c6577" },
  { tipo: "mesa-rectangular-6", etiqueta: "Mesa rectangular (6)", categoria: "mesas", forma: "rectangulo", anchoM: 1.8, largoM: 0.75, asientos: 6, color: "#1b4552" },
  { tipo: "mesa-rectangular-8", etiqueta: "Mesa rectangular (8)", categoria: "mesas", forma: "rectangulo", anchoM: 2.4, largoM: 0.75, asientos: 8, color: "#1b4552" },
  { tipo: "mesa-cocktail", etiqueta: "Mesa cóctel (de pie)", categoria: "mesas", forma: "circulo", anchoM: 0.75, largoM: 0.75, asientos: 0, color: "#6e7c80" },
  { tipo: "mesa-buffet", etiqueta: "Mesa de buffet", categoria: "mesas", forma: "rectangulo", anchoM: 1.8, largoM: 0.6, asientos: 0, color: "#a9b923" },
  { tipo: "silla", etiqueta: "Silla suelta", categoria: "sillas", forma: "rectangulo", anchoM: 0.45, largoM: 0.45, asientos: 1, color: "#c7d92e" },
  { tipo: "tarima", etiqueta: "Tarima", categoria: "espacios", forma: "rectangulo", anchoM: 3, largoM: 2.4, asientos: 0, color: "#9c6b3f" },
  { tipo: "pista-baile", etiqueta: "Pista de baile", categoria: "espacios", forma: "rectangulo", anchoM: 4, largoM: 4, asientos: 0, color: "#d8cba8" },
  { tipo: "bar", etiqueta: "Bar", categoria: "espacios", forma: "rectangulo", anchoM: 2.4, largoM: 0.6, asientos: 0, color: "#3d3d3d" },
  { tipo: "dj", etiqueta: "DJ / Música", categoria: "espacios", forma: "rectangulo", anchoM: 1.5, largoM: 1, asientos: 0, color: "#5a3d8a" },
];

export const CATALOGO_POR_TIPO: Record<TipoItem, DefinicionItem> = Object.fromEntries(
  CATALOGO_ITEMS.map((d) => [d.tipo, d])
) as Record<TipoItem, DefinicionItem>;

export type ItemColocado = {
  id: string;
  tipo: TipoItem;
  xM: number;
  yM: number;
  rotacion: number;
};

/** m² recomendados por invitado (referencia general de la industria de eventos, no una norma exacta). */
export const AREA_POR_INVITADO = {
  banquete: 1.3,
  coctel: 0.8,
} as const;
