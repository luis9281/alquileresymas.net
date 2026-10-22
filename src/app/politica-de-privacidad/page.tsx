import type { Metadata } from "next";
import Link from "next/link";
import { CONTACTO } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Política de privacidad | Alquileres Eventos & Más",
  description:
    "Cómo Alquileres Eventos & Más recopila, usa y protege los datos personales que compartes en nuestro sitio web.",
  alternates: { canonical: "/politica-de-privacidad" },
};

const ACTUALIZADO = "22 de octubre de 2026";

export default function PoliticaPrivacidadPage() {
  return (
    <>
      <section className="bg-teal-dark px-6 py-16 text-white">
        <div className="mx-auto max-w-[1350px]">
          <h1 className="text-white">Política de privacidad</h1>
          <p className="mt-3 text-white/75">Última actualización: {ACTUALIZADO}</p>
        </div>
      </section>

      <section className="prose prose-neutral mx-auto max-w-3xl px-6 py-16">
        <p>
          En Alquileres Eventos & Más respetamos tu privacidad. Esta política explica qué datos personales
          recopilamos a través de www.alquileresymas.net, para qué los usamos y cuáles son tus derechos,
          conforme a la Ley 81 de 2019 sobre Protección de Datos Personales de la República de Panamá y su
          reglamentación.
        </p>

        <h2>1. Responsable del tratamiento</h2>
        <p>
          Alquileres Eventos & Más, con domicilio en {CONTACTO.direccion}. Para cualquier asunto relacionado
          con tus datos personales puedes escribirnos a{" "}
          <a href={`mailto:${CONTACTO.emails.gerencia}`}>{CONTACTO.emails.gerencia}</a>.
        </p>

        <h2>2. Datos que recopilamos</h2>
        <ul>
          <li>
            <strong>Formulario de cotización:</strong> nombre, correo electrónico, teléfono, fecha y lugar del
            evento, el mensaje que nos escribas y los productos que agregues a tu lista.
          </li>
          <li>
            <strong>WhatsApp, correo y teléfono:</strong> la información que nos compartas al contactarnos por
            estos medios.
          </li>
          <li>
            <strong>Datos de navegación:</strong> información técnica y estadística, como páginas visitadas,
            tipo de dispositivo, navegador y ubicación aproximada, obtenida mediante cookies y herramientas de
            analítica.
          </li>
        </ul>
        <p>No solicitamos datos sensibles ni datos de pago a través de este sitio.</p>

        <h2>3. Para qué usamos tus datos</h2>
        <ul>
          <li>Preparar y enviarte la cotización que solicitas y dar seguimiento a tu evento.</li>
          <li>Responder tus consultas y coordinar la entrega, el montaje y el retiro del mobiliario.</li>
          <li>Mejorar el sitio web y entender qué contenido resulta más útil.</li>
          <li>Cumplir obligaciones legales, contables y fiscales.</li>
        </ul>
        <p>
          La base para tratar tus datos es tu consentimiento, que otorgas al enviar el formulario o
          contactarnos, y la necesidad de atender la solicitud que nos haces. No vendemos ni alquilamos tus
          datos personales, ni los usamos para enviarte publicidad sin tu autorización.
        </p>

        <h2>4. Con quién compartimos tus datos</h2>
        <p>
          Solo compartimos información con proveedores que nos ayudan a operar el sitio, y únicamente en la
          medida necesaria:
        </p>
        <ul>
          <li>
            <strong>Vercel</strong>, servicio de alojamiento del sitio web.
          </li>
          <li>
            <strong>Nuestro proveedor de correo electrónico</strong>, a través del cual recibimos las
            solicitudes de cotización.
          </li>
          <li>
            <strong>Google</strong> (Google Analytics y Google Maps), para medir el uso del sitio y mostrar
            nuestra ubicación.
          </li>
          <li>
            <strong>WhatsApp (Meta)</strong>, cuando eliges enviarnos tu solicitud por ese medio.
          </li>
        </ul>
        <p>
          Algunos de estos proveedores procesan datos fuera de Panamá. También podremos revelar información
          cuando lo exija una autoridad competente conforme a la ley.
        </p>

        <h2>5. Cookies y almacenamiento local</h2>
        <p>
          Usamos cookies de Google Analytics para obtener estadísticas anónimas de visitas. Además, el sitio
          guarda en tu navegador (almacenamiento local) la lista de productos que agregas a tu cotización,
          para que no la pierdas si cierras la página; esa información no se envía a nosotros hasta que
          envías el formulario. Puedes borrar las cookies y el almacenamiento local o bloquearlos desde la
          configuración de tu navegador.
        </p>

        <h2>6. Cuánto tiempo conservamos tus datos</h2>
        <p>
          Conservamos los datos de las cotizaciones mientras sean necesarios para atender tu solicitud y dar
          seguimiento comercial, y durante los plazos que exijan las normas contables y fiscales. Después los
          eliminamos o anonimizamos.
        </p>

        <h2>7. Tus derechos</h2>
        <p>Como titular de tus datos puedes, en cualquier momento:</p>
        <ul>
          <li><strong>Acceder</strong> a los datos que tenemos sobre ti.</li>
          <li><strong>Rectificar</strong> los datos que sean inexactos o estén incompletos.</li>
          <li><strong>Cancelar</strong> o pedir que eliminemos tus datos.</li>
          <li><strong>Oponerte</strong> a un tratamiento determinado.</li>
          <li><strong>Solicitar la portabilidad</strong> de tus datos.</li>
          <li><strong>Revocar</strong> el consentimiento que nos diste.</li>
        </ul>
        <p>
          Para ejercerlos, escríbenos a{" "}
          <a href={`mailto:${CONTACTO.emails.gerencia}`}>{CONTACTO.emails.gerencia}</a> indicando tu nombre
          y tu solicitud. Te responderemos dentro de los plazos que establece la ley. Si consideras que no
          hemos atendido tu solicitud adecuadamente, puedes acudir a la Autoridad Nacional de Transparencia
          y Acceso a la Información (ANTAI).
        </p>

        <h2>8. Seguridad</h2>
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger tus datos, como conexiones
          cifradas (HTTPS) y acceso restringido al personal que los necesita para atender tu solicitud.
        </p>

        <h2>9. Menores de edad</h2>
        <p>
          Este sitio está dirigido a personas mayores de edad. No recopilamos de forma intencional datos de
          menores.
        </p>

        <h2>10. Cambios a esta política</h2>
        <p>
          Podemos actualizar esta política para reflejar cambios en nuestros servicios o en la ley. Publicaremos
          la versión vigente en esta página con su fecha de actualización.
        </p>

        <h2>11. Contacto</h2>
        <p>
          Si tienes preguntas sobre esta política, escríbenos a{" "}
          <a href={`mailto:${CONTACTO.emails.gerencia}`}>{CONTACTO.emails.gerencia}</a>, llámanos al{" "}
          {CONTACTO.telefono} o visita nuestra página de <Link href="/contacto">contacto</Link>.
        </p>
      </section>
    </>
  );
}
