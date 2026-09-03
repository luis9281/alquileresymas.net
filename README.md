# Alquileres Eventos & Más — sitio web

Sitio construido desde cero en **Next.js** (App Router, TypeScript, Tailwind CSS,
Framer Motion) para catálogo de mobiliario/equipo de renta para eventos, con
sistema de **solicitud de cotización** (sin carrito ni pago en línea) y blog +
catálogo administrados desde **Sanity Studio**, embebido en el propio sitio en
`/studio` — no necesitas WordPress ni un CMS aparte.

Estructura de navegación inspirada en icebug.com (catálogo por categoría, grid
de producto) y bynd.com (grid de servicios/casos, sección de blog/insights).

## Stack

- **Next.js 16** (App Router, TypeScript, `output: "standalone"` para poder
  correr en un hosting con Node.js propio, incluido cPanel).
- **Tailwind CSS v4** para estilos, con la paleta de marca (teal + lima,
  tomada del logo) definida en `src/app/globals.css`.
- **Framer Motion** para las transiciones (menú móvil, reveals al hacer
  scroll, contador de cotización, formulario).
- **Sanity** como CMS headless: Studio embebido en `/studio`, esquemas para
  Producto, Categoría de producto y Entrada de blog en `src/sanity/schemaTypes/`.
- **Nodemailer** en una API route (`/api/cotizacion`) para enviar la
  solicitud de cotización por correo, sin pasarela de pago.

## Estructura del proyecto

```
logos/                  Logo original (primary, dark, favicon)
productos/               Fotos de producto ya organizadas por categoría (fuente para Sanity)
public/muestras/         Subconjunto de esas fotos usado como datos de muestra mientras Sanity está vacío
bin/import-a-sanity.mjs  Script para cargar productos/* a Sanity como borrador (npm run import:sanity)
src/app/                 Rutas (App Router): home, catalogo, blog, cotizacion, studio, api
src/components/          Header, Footer, cards, formulario de cotización, animaciones
src/lib/                 Cliente y queries de Sanity + datos de muestra (fallback)
src/sanity/schemaTypes/  Esquemas de contenido: producto, categoriaProducto, post
sanity.config.ts         Configuración de Sanity Studio (montado en /studio)
```

## Cómo funciona el catálogo y el "carrito" de cotización

No hay pagos en línea. Cada producto tiene un botón **Agregar** que guarda el
producto en `localStorage` del navegador (`src/components/QuoteContext.tsx`).
La página `/cotizacion` muestra esa lista (editable: cantidad, quitar) y un
formulario (nombre, email, teléfono, fecha del evento, lugar, mensaje). Al
enviarlo, `src/app/api/cotizacion/route.ts` valida los datos y envía un correo
por SMTP — no se guarda tarjeta ni se cobra nada.

Mientras no haya un proyecto de Sanity configurado (o esté vacío), todas las
páginas usan datos de muestra (`src/lib/sample-data.ts`) construidos con fotos
reales de `productos/`, así que el sitio se ve funcional desde el primer
`npm run dev`.

## Puesta en marcha

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Abre `http://localhost:3000`.

### 1. Configurar Sanity (para poder publicar sin tocar código)

1. Crea una cuenta gratis en [sanity.io](https://www.sanity.io/) y un proyecto
   nuevo (puedes hacerlo desde `npx sanity@latest init` dentro de esta carpeta,
   o desde sanity.io/manage).
2. Copia el **Project ID** que te da y pégalo en `.env.local` como
   `NEXT_PUBLIC_SANITY_PROJECT_ID`. Deja `NEXT_PUBLIC_SANITY_DATASET=production`.
   ⚠️ En sanity.io/manage el **Organization ID** se ve muy parecido (mismo
   formato alfanumérico) pero es otra cosa — el que necesitas es el que
   aparece dentro de la página del proyecto específico, no el de la
   organización. Nuestro proyecto real quedó con ID `amapylto`.
3. Reinicia `npm run dev` y entra a `http://localhost:3000/studio` — ahí
   inicias sesión con tu cuenta de Sanity y ya puedes crear Categorías,
   Productos y Entradas de blog con una interfaz visual, sin código.
4. Cuando publiques el sitio, agrega las mismas variables de entorno en tu
   hosting.

**Para cargar de una vez las fotos que ya tienes organizadas en `productos/`**
(en vez de subirlas una por una a mano):

1. En [sanity.io/manage](https://sanity.io/manage) → tu proyecto → **API** →
   **Tokens** → **Add API token**, con permisos **Editor**. Copia el token.
2. Pégalo en `.env.local` como `SANITY_API_TOKEN` (nunca lo compartas fuera de
   ese archivo — no está en git).
3. Corre:

   ```bash
   npm run import:sanity
   ```

   Esto sube cada foto de `productos/<categoria>/` y crea un producto **en
   borrador** en Sanity (categoría, título tomado del nombre del archivo,
   una sola foto). Es seguro volver a correrlo: los productos/categorías que
   ya existen se dejan intactos, solo se agregan los que falten.
4. Varias fotos son el mismo mueble en distinto color (ej. "Mesa Nova Luxe -
   Blanca" y "- Chocolate"). Para fusionarlas automaticamente en un solo
   producto con sus colores como variantes, corre:

   ```bash
   npm run merge:variantes
   ```

   El script agrupa por nombre (ignorando color y palabras de ángulo como
   "otro ángulo") y arma las variantes de color automáticamente. También
   puedes correr `node --env-file=.env.local bin/merge-variantes.mjs --dry`
   primero para ver el resultado sin escribir nada. Es seguro volver a
   correrlo después de importar fotos nuevas — solo toca productos que aún
   no tengan variantes asignadas.
5. Nada queda visible en el sitio hasta que entres a `/studio`, revises cada
   producto (título, si el agrupado automático tiene sentido, medidas,
   capacidad, descripción) y presiones **Publish** en cada uno — Studio
   guarda como borrador automáticamente mientras editas, así que si cierras
   sin publicar, el cambio queda guardado pero invisible en el sitio.

   Si ya revisaste todo (o prefieres revisar publicado y corregir después),
   puedes publicar todos los borradores pendientes de una vez con:

   ```bash
   npm run publish:all
   ```

### 2. Slideshow del hero (portada)

`src/components/Hero.tsx` muestra un slideshow de fondo (`HeroSlideshow` +
`src/lib/hero-slides.ts`), mezclando video e imágenes con transición de
crossfade. `public/eventos/` tiene contenido de muestra gratuito con
licencia Pexels (libre para uso comercial, no requiere atribución, aunque
se agradece):

- `decoracion-evento-video.mp4` — Mikhail Nilov (también usado como poster: `decoracion-evento-1.jpg`)
- `sillas-tiffany-evento.jpg` — Erta Caushi
- `salon-sillas-tiffany-1.jpg` — atx (usada también en la sección "Nuestros servicios")
- `evento-corporativo-2.jpg` — am83

Para poner el video/fotos reales de la empresa (o reemplazar las de
muestra):

1. Descarga el archivo con licencia (no un preview con marca de agua) y
   colócalo en `public/eventos/`.
2. Edita `src/lib/hero-slides.ts`: agrega una entrada nueva
   (`{ type: "video", src: "/eventos/tu-video.mp4" }` o
   `{ type: "image", src: "/eventos/tu-foto.jpg", alt: "..." }`) o reemplaza
   una de las de muestra.
3. Guarda — el slideshow lo recoge automáticamente, sin tocar el componente.

### 3. Configurar el envío de correo de "Solicitud de cotización"

En `.env.local`, completa `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
(la cuenta de correo que te da tu cPanel, por ejemplo
`ventas@alquileresymas.net`) y `QUOTE_TO_EMAIL` (a dónde quieres que lleguen
las solicitudes). Sin esto configurado, el formulario responde con un error
controlado en vez de fallar en silencio.

## Publicar en tu hosting (cPanel con Node.js)

1. En cPanel, busca **Setup Node.js App** (disponible en la mayoría de
   hostings con CloudLinux) y crea una app nueva apuntando a esta carpeta,
   con "Application startup file" en modo Next.js standalone (ver docs de tu
   proveedor de hosting para el detalle exacto del comando de arranque).
2. Corre `npm install` y `npm run build` (cPanel suele darte un botón para
   esto, o acceso SSH).
3. Arranca la app con `npm run start` (usa el puerto que cPanel te asigne via
   la variable de entorno `PORT`).
4. Configura ahí mismo las variables de entorno (`NEXT_PUBLIC_SANITY_*`,
   `SMTP_*`, `QUOTE_TO_EMAIL`) desde el panel de Node.js App de cPanel.
5. Si tu plan de cPanel **no** soporta Node.js, la alternativa más simple es
   mover el hosting a [Vercel](https://vercel.com) (gratis para este tamaño
   de sitio, despliegue automático conectando el repositorio de git).

## Qué falta que definas/agregues

- Contenido real de **Nosotros** y **Contacto** (`src/app/nosotros/page.tsx`,
  `src/app/contacto/page.tsx` — ahora mismo tienen texto de relleno).
- Teléfono / WhatsApp reales en el footer (`src/components/Footer.tsx`).
- **Catálogo**: los 43 productos importados (bares-counters-podiums, mesas,
  salas-lounge, sillas) ya están publicados y visibles en el sitio. Las
  demás categorías (buffet-catering, coolers-hieleras, decoracion-ambientacion,
  manteles-licras, plantas-potes-decorativos, utileria) todavía no tienen
  fotos en `productos/` — cuando las agregues, corre `npm run import:sanity`,
  `npm run merge:variantes`, revisa en `/studio` y publica (o `npm run
  publish:all` si no necesitas revisar antes).
  ⚠️ Recuerda: en Sanity Studio los cambios se autoguardan como borrador,
  pero **no se ven en el sitio hasta que presiones Publish** en cada
  documento — es la causa más común de "no me aparece nada".
- Primeras entradas del blog, ya escribibles 100% desde `/studio` sin tocar
  código una vez configurado Sanity.
- Video/fotos reales de la empresa para el slideshow del hero (ver sección
  arriba) — hoy usa contenido de muestra gratuito con licencia Pexels.
