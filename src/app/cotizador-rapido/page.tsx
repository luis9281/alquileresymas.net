import type { Metadata } from "next";
import CotizadorRapido, { type OpcionProducto } from "@/components/CotizadorRapido";
import { getProductos } from "@/lib/sanity/queries";
import { aListados, tituloListado } from "@/lib/producto";
import { precioDeVariante } from "@/lib/precio";

export const metadata: Metadata = {
  title: "Cotizador rápido | Alquileres Eventos & Más",
  description: "Arma tu cotización de mobiliario para eventos en minutos: busca productos, elige cantidades y ve el total con ITBMS y transporte.",
  alternates: { canonical: "/cotizador-rapido" },
};

export default async function CotizadorRapidoPage() {
  const productos = await getProductos();
  // One option per color variant, trimmed to what the search box needs.
  const opciones: OpcionProducto[] = aListados(productos).map((l) => {
    const { producto, varianteIdx } = l;
    const variante = producto.variantes[varianteIdx];
    return {
      id: `${producto._id}::${varianteIdx}`,
      titulo: tituloListado(l),
      categoria: [producto.categoria.nombre, producto.subcategoria, producto.tipo].filter(Boolean).join(" › "),
      precio: precioDeVariante(producto, varianteIdx),
      imagen: variante?.imagenes[0],
    };
  });

  return (
    <>
      <section className="bg-teal-dark px-6 py-12 text-white">
        <div className="mx-auto max-w-[1350px]">
          <h1 className="text-white">Cotizador rápido</h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Busca los productos, indica cantidades y fechas, y obtén al instante un estimado con ITBMS y
            transporte. Envíalo por correo o WhatsApp y te confirmamos disponibilidad.
          </p>
        </div>
      </section>

      <section className="bg-[#eef1f4] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-[1350px]">
          <CotizadorRapido opciones={opciones} />
        </div>
      </section>
    </>
  );
}
