import type { Metadata } from "next";
import { preconnect } from "react-dom";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import JsonLd from "@/components/JsonLd";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/GoogleTagManager";
import { QuoteProvider } from "@/components/QuoteContext";
import { CONTACTO, LAT, LNG, SITE_URL } from "@/lib/site-info";
import { getCategorias } from "@/lib/sanity/queries";
import { ordenarAlfabeticamente } from "@/lib/categorias";

// Fuentes servidas desde el repo (subconjunto "latin" de Google Fonts, variables).
// Con next/font/google el build en Vercel fallaba si no lograba descargarlas.
const playfair = localFont({
  src: "./fonts/PlayfairDisplay-latin.woff2",
  weight: "500 700",
  display: "swap",
  variable: "--font-playfair",
});

const workSans = localFont({
  src: "./fonts/WorkSans-latin.woff2",
  weight: "400 600",
  display: "swap",
  variable: "--font-worksans",
});

// Refresca el contenido de Sanity (Vercel/produccion) cada hora como maximo,
// sin necesitar un redeploy. Aplica a todas las paginas salvo que una
// defina su propio `revalidate` mas corto. Antes era 60s y disparaba el
// consumo de ISR en el plan Hobby de Vercel.
export const revalidate = 3600;

const SITE_TITLE = "Alquileres Eventos & Más";
const SITE_DESCRIPTION =
  "Renta de mobiliario y equipo para eventos en Panamá: sillas, mesas, bares, cristalería y decoración. Entrega, montaje y transporte propio incluidos. Cotiza sin compromiso.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_PA",
    siteName: SITE_TITLE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE_TITLE,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  image: `${SITE_URL}/logo.png`,
  telephone: CONTACTO.telefono,
  email: CONTACTO.emails.ventas,
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACTO.direccion,
    addressLocality: "Ciudad de Panamá",
    addressCountry: "PA",
  },
  geo: { "@type": "GeoCoordinates", latitude: LAT, longitude: LNG },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "08:00", closes: "14:00" },
  ],
  sameAs: [CONTACTO.redes.facebook, CONTACTO.redes.instagram, CONTACTO.redes.tiktok],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Product photos come from Sanity's CDN: open that connection while the HTML is still loading.
  preconnect("https://cdn.sanity.io");
  const categorias = ordenarAlfabeticamente(await getCategorias());

  return (
    <html lang="es">
      <body className={`${playfair.variable} ${workSans.variable} antialiased`}>
        <GoogleTagManagerNoScript />
        <GoogleTagManager />
        <GoogleAnalytics />
        <JsonLd data={localBusinessJsonLd} />
        <QuoteProvider>
          <Header categorias={categorias.map(({ slug, nombre }) => ({ slug, nombre }))} />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
        </QuoteProvider>
      </body>
    </html>
  );
}
