/**
 * Shared image optimizer used before anything is uploaded to Sanity.
 *
 * - Respects EXIF orientation, then strips all metadata (Photoshop/XMP
 *   blocks are what made some 1024x1024 photos weigh 6-7 MB).
 * - Caps the longest side at MAX_LADO px (the site never shows more than
 *   1200 px wide, so 2000 leaves room for crops/retina).
 * - Photos -> JPEG (mozjpeg, quality 82). Images with transparency stay PNG.
 * - If the result isn't smaller than the original, the original is kept.
 */
import sharp from "sharp";

export const MAX_LADO = 2000;
const CALIDAD_JPEG = 82;

/**
 * @param {Buffer} original
 * @returns {Promise<{ buffer: Buffer, ext: ".jpg" | ".png" | null, contentType: string | null, optimizada: boolean }>}
 *   ext/contentType are null when the original was kept untouched.
 */
export async function optimizarImagen(original) {
  const meta = await sharp(original).metadata();
  const conTransparencia = Boolean(meta.hasAlpha) && !(await esOpaca(original));

  const base = sharp(original)
    .rotate()
    .resize({ width: MAX_LADO, height: MAX_LADO, fit: "inside", withoutEnlargement: true });

  const buffer = conTransparencia
    ? await base.png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer()
    : await base.flatten({ background: "#ffffff" }).jpeg({ quality: CALIDAD_JPEG, mozjpeg: true }).toBuffer();

  if (buffer.length >= original.length) {
    return { buffer: original, ext: null, contentType: null, optimizada: false };
  }
  return {
    buffer,
    ext: conTransparencia ? ".png" : ".jpg",
    contentType: conTransparencia ? "image/png" : "image/jpeg",
    optimizada: true,
  };
}

// PNGs often carry an alpha channel that is fully opaque; those are safe as JPEG.
async function esOpaca(original) {
  const { channels } = await sharp(original).stats();
  const alfa = channels[3];
  return !alfa || alfa.min === 255;
}

/** "Mesa Nova Luxe 1000x1000..png" + ".jpg" -> "Mesa Nova Luxe 1000x1000.jpg" */
export function cambiarExtension(nombre, ext) {
  return nombre.replace(/\.+[^.]+$/, "") + ext;
}

export const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
