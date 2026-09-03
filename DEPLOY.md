# Guía de despliegue

Este proyecto es una app Next.js 16 (App Router) con:
- Renderizado en servidor (no es HTML estático).
- Sanity Studio embebido en `/studio`.
- Envío de correo (SMTP) para el formulario de cotización.
- Imágenes optimizadas al vuelo con `next/image` (usa `sharp`).

Por eso necesita un servidor con Node.js corriendo — no sirve un hosting de "solo archivos".

## 0. Antes de migrar

- Confirma tu versión de Node: `node -v`. Next.js 16 requiere **Node 20.9 o superior** (recomendado: Node 20 LTS o 22 LTS).
- Prueba el build en local primero:
  ```bash
  npm run build
  npm start
  ```
  Si esto funciona en tu máquina, funcionará igual en el servidor.

## 1. Variables de entorno que necesita el servidor

Copia `.env.local.example` a `.env.local` (o configúralas directo en el panel del hosting) con tus valores reales:

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Conectar con tu proyecto de Sanity (CMS) |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset de Sanity (normalmente `production`) |
| `SANITY_API_TOKEN` | Solo si vas a correr el script de importación masiva en el servidor |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Envío de correo del formulario de cotización |
| `QUOTE_TO_EMAIL` | A dónde llegan las solicitudes de cotización |

**Nunca subas `.env.local` a git.** Ya está en `.gitignore`.

## Opción A — Vercel (la más simple, cero servidor que mantener)

Next.js lo hace el mismo equipo de Vercel, así que el deploy es prácticamente automático:

1. Sube el repo a GitHub (si no lo está ya).
2. Entra a vercel.com → "Add New Project" → conecta el repo.
3. Pega las variables de entorno de la tabla de arriba en la pantalla de configuración.
4. Deploy. Cada push a la rama principal despliega solo.
5. Conecta tu dominio real (`alquileresymas.net`) desde el panel de Vercel — te da los registros DNS exactos para pegar donde tengas el dominio.

Tiene plan gratuito de sobra para este tamaño de sitio, con SSL automático.

## Opción B — Servidor propio / VPS (Bluehost VPS, DigitalOcean, etc.)

Usa esto si necesitas mantener todo en tu propio servidor.

### 1. Preparar el servidor
```bash
# Instalar Node (vía nvm, para controlar la versión)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 20
nvm use 20

# Gestor de procesos para mantener la app viva
npm install -g pm2
```

### 2. Subir el código
```bash
git clone <tu-repo> alquileresymas
cd alquileresymas
npm install
```
Crea `.env.local` en el servidor con las variables reales (tabla arriba).

### 3. Build y arranque
```bash
npm run build
pm2 start npm --name alquileresymas -- start
pm2 save
pm2 startup   # deja la app corriendo aunque el servidor reinicie
```
Por defecto Next.js sirve en el puerto 3000.

### 4. Nginx como proxy reverso + SSL
Instala Nginx y certbot, y crea un server block:
```nginx
server {
    listen 80;
    server_name alquileresymas.net www.alquileresymas.net;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Luego:
```bash
sudo certbot --nginx -d alquileresymas.net -d www.alquileresymas.net
```
Esto activa HTTPS automático y renovación.

### 5. Apuntar el dominio
En el panel de DNS de tu dominio, apunta el registro `A` a la IP del VPS (y `www` como `CNAME` o `A` también).

## Opción C — Docker (si el hosting soporta contenedores)

El proyecto ya está configurado con `output: "standalone"` en `next.config.ts`, pensado exactamente para esto — genera un build mínimo autocontenido.

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Después de migrar: qué probar

- [ ] La home carga y muestra categorías/productos reales (confirma que Sanity está conectado con las variables correctas de producción).
- [ ] `/studio` abre y puedes iniciar sesión con tu cuenta de Sanity.
- [ ] El formulario de `/cotizacion` envía el correo correctamente (revisa que llegue a `QUOTE_TO_EMAIL`).
- [ ] El botón de WhatsApp abre el chat con el número correcto.
- [ ] Las imágenes cargan (tanto las de `/public` como las de Sanity CDN).
- [ ] El certificado SSL está activo (candado verde, sin advertencias).
