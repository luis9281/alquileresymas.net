import type { Metadata } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import JsonLd from "@/components/JsonLd";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { QuoteProvider } from "@/components/QuoteContext";
import { CONTACTO, LAT, LNG } from "@/lib/site-info";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-playfair",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-worksans",
});

// Refresca el contenido de Sanity (Vercel/produccion) cada 60s como maximo,
// sin necesitar un redeploy. Aplica a todas las paginas salvo que una
// defina su propio `revalidate` mas corto.
export const revalidate = 60;

const SITE_URL = "https://www.alquileresymas.net";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${playfair.variable} ${workSans.variable} antialiased`}>
        <GoogleAnalytics />
        <JsonLd data={localBusinessJsonLd} />
        <QuoteProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
        </QuoteProvider>
      </body>
    </html>
  );
}
