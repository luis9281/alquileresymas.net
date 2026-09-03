import { CONTACTO } from "@/lib/site-info";

export default function WhatsAppButton() {
  return (
    <a
      href={CONTACTO.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.41-1.35a9.9 9.9 0 0 0 4.63 1.15h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.79 14.02c-.24.68-1.4 1.3-1.94 1.36-.5.06-1.1.09-1.77-.11-.41-.12-.93-.29-1.6-.57-2.82-1.22-4.66-4.06-4.8-4.25-.14-.19-1.15-1.53-1.15-2.92s.72-2.07.98-2.35c.24-.28.53-.34.71-.34h.5c.16 0 .38-.03.58.44.24.57.79 1.98.87 2.12.07.15.12.32.02.52-.09.19-.14.31-.28.48-.14.16-.29.36-.42.48-.14.14-.29.28-.12.56.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.61-.07.17-.19.71-.83.9-1.11.19-.28.38-.23.63-.14.26.09 1.64.77 1.92.91.28.14.47.21.53.33.07.12.07.68-.16 1.35Z" />
      </svg>
    </a>
  );
}
