const DIRECCION = "Ave. Domingo Díaz, Antiguo Auto Depot, Local B19 - B20 - B21, Ciudad de Panamá";

// Coordenadas exactas del local, resueltas desde el link de Google Maps que compartio el cliente.
export const LAT = 9.042189;
export const LNG = -79.4703409;

export const CONTACTO = {
  emails: {
    gerencia: "gerencia@alquileresymas.net",
    ventas: "ventas@alquileresymas.net",
    ventas1: "ventas1@alquileresymas.net",
  },
  telefono: "+507 6672-8087",
  whatsappUrl: "https://wa.me/50766728087",
  direccion: DIRECCION,
  mapaUrl: "https://maps.app.goo.gl/DHVU83PRqwx7gfos7",
  mapaEmbedUrl: `https://www.google.com/maps?q=${LAT},${LNG}&z=17&output=embed`,
  horario: [
    { dias: "Lunes a Viernes", horas: "8:00 a.m. – 5:00 p.m." },
    { dias: "Sábados", horas: "8:00 a.m. – 2:00 p.m." },
  ],
  redes: {
    facebook: "https://www.facebook.com/alquilerymas/",
    instagram: "https://www.instagram.com/alquileresymas/",
    tiktok: "https://www.tiktok.com/@alquileresymas",
  },
};
