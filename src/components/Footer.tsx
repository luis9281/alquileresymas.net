import Link from "next/link";
import { getCategorias } from "@/lib/sanity/queries";
import { CONTACTO } from "@/lib/site-info";
import SocialLinks from "./SocialLinks";

export default async function Footer() {
  const categorias = await getCategorias();

  return (
    <footer className="mt-20 bg-teal-dark text-white/85">
      <div className="mx-auto max-w-[1350px] px-6 py-16 text-center">
        <h2 className="text-white">¿Listo para tu próximo evento?</h2>
        <p className="mx-auto mt-3 max-w-md">
          Arma tu lista de mobiliario y equipo, y te enviamos una cotización sin compromiso.
        </p>
        <Link
          href="/cotizacion"
          className="mt-6 inline-flex rounded-md bg-lime px-7 py-3 font-semibold text-teal-dark hover:bg-lime-dark"
        >
          Solicitar cotización
        </Link>
      </div>

      <div className="mx-auto grid max-w-[1350px] gap-10 border-t border-white/15 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-display text-lg text-white">Alquileres Eventos & Más</p>
          <p className="mt-2 text-sm">Mobiliario y equipo para eventos memorables.</p>
          <SocialLinks className="mt-4 flex items-center gap-4" />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Catálogo</h3>
          <ul className="space-y-2 text-sm">
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalogo/${c.slug}`} className="hover:text-lime">
                  {c.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Empresa</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/nosotros" className="hover:text-lime">Nosotros</Link></li>
            <li><Link href="/blog" className="hover:text-lime">Blog</Link></li>
            <li><Link href="/contacto" className="hover:text-lime">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Contacto</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={CONTACTO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-lime">
                {CONTACTO.telefono} (WhatsApp)
              </a>
            </li>
            <li><a href={`mailto:${CONTACTO.emails.gerencia}`} className="hover:text-lime">{CONTACTO.emails.gerencia}</a></li>
            <li><a href={`mailto:${CONTACTO.emails.ventas}`} className="hover:text-lime">{CONTACTO.emails.ventas}</a></li>
            <li><a href={`mailto:${CONTACTO.emails.ventas1}`} className="hover:text-lime">{CONTACTO.emails.ventas1}</a></li>
            <li>
              <a href={CONTACTO.mapaUrl} target="_blank" rel="noopener noreferrer" className="hover:text-lime">
                {CONTACTO.direccion}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15 px-6 py-5 text-center text-xs">
        © {new Date().getFullYear()} Alquileres Eventos & Más. Todos los derechos reservados.
      </div>
    </footer>
  );
}
