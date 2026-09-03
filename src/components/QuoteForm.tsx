"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuote } from "./QuoteContext";
import { CONTACTO } from "@/lib/site-info";
import type { QuoteItem } from "@/lib/types";

function construirMensajeWhatsApp(form: HTMLFormElement, items: QuoteItem[]) {
  const data = new FormData(form);
  const campos: [string, string][] = [
    ["Nombre", String(data.get("nombre") || "")],
    ["Correo", String(data.get("email") || "")],
    ["Teléfono", String(data.get("telefono") || "")],
    ["Fecha del evento", String(data.get("fecha_evento") || "")],
    ["Lugar del evento", String(data.get("lugar") || "")],
  ];

  const lineas = ["Hola, quiero solicitar una cotización:", ""];
  for (const [label, valor] of campos) {
    if (valor) lineas.push(`*${label}:* ${valor}`);
  }

  const mensaje = String(data.get("mensaje") || "");
  if (mensaje) lineas.push("", mensaje);

  if (items.length > 0) {
    lineas.push("", "*Productos:*");
    for (const item of items) {
      lineas.push(`- ${item.title} x${item.qty}`);
    }
  }

  return lineas.join("\n");
}

export default function QuoteForm() {
  const { items, removeItem, updateQty, clearAll } = useQuote();
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = new FormData(event.currentTarget);
    const payload = {
      nombre: String(form.get("nombre") || ""),
      email: String(form.get("email") || ""),
      telefono: String(form.get("telefono") || ""),
      fechaEvento: String(form.get("fecha_evento") || ""),
      lugar: String(form.get("lugar") || ""),
      mensaje: String(form.get("mensaje") || ""),
      website: String(form.get("website") || ""),
      items,
    };

    try {
      const res = await fetch("/api/cotizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "No se pudo enviar la solicitud.");
        return;
      }
      setStatus("ok");
      clearAll();
      (event.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
      setErrorMsg("No se pudo enviar la solicitud. Revisa tu conexion e intenta de nuevo.");
    }
  }

  function handleWhatsApp(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    if (!form) return;
    const mensaje = construirMensajeWhatsApp(form, items);
    const url = `${CONTACTO.whatsappUrl}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid gap-12 md:grid-cols-2">
      <div>
        <h2 className="text-2xl">Productos seleccionados</h2>

        <ul className="mt-5 space-y-3">
          <AnimatePresence initial={false}>
            {items.length === 0 && (
              <motion.li
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-muted"
              >
                Aún no has agregado productos. Explora el catálogo y presiona &ldquo;Agregar&rdquo; en lo que te interese.
              </motion.li>
            )}
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="flex items-center gap-3 rounded-md border border-border bg-white p-3"
              >
                {item.image && (
                  <Image src={item.image} alt="" width={56} height={56} className="h-14 w-14 rounded object-cover" />
                )}
                <span className="flex-1 text-sm font-semibold">{item.title}</span>
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) => updateQty(item.id, Number(e.target.value))}
                  className="w-14 rounded border border-border p-1 text-center"
                  aria-label={`Cantidad de ${item.title}`}
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Quitar ${item.title}`}
                  className="text-lg text-muted hover:text-ink"
                >
                  ×
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <p className="mt-5">
          <Link href="/catalogo" className="font-semibold text-teal">
            Seguir explorando el catálogo →
          </Link>
        </p>
      </div>

      <div>
        {status === "ok" && (
          <p className="mb-5 rounded-md bg-green-100 px-4 py-3 font-semibold text-green-800">
            Gracias, recibimos tu solicitud. Te contactaremos muy pronto.
          </p>
        )}
        {status === "error" && (
          <p className="mb-5 rounded-md bg-red-100 px-4 py-3 font-semibold text-red-800">{errorMsg}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

          <Field label="Nombre completo *" name="nombre" required />
          <Field label="Correo electrónico *" name="email" type="email" required />
          <Field label="Teléfono" name="telefono" type="tel" />
          <Field label="Fecha del evento" name="fecha_evento" type="date" />
          <Field label="Lugar del evento" name="lugar" />

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Cuéntanos más</span>
            <textarea name="mensaje" rows={4} className="w-full rounded-md border border-border bg-white p-3" />
          </label>

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-2 rounded-md bg-lime px-6 py-3 font-semibold text-teal-dark hover:bg-lime-dark disabled:opacity-60"
          >
            {status === "sending" ? "Enviando…" : "Enviar solicitud de cotización"}
          </button>

          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="h-px flex-1 bg-border" />
            o
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 py-3 font-semibold text-white hover:brightness-95"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.41-1.35a9.9 9.9 0 0 0 4.63 1.15h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.79 14.02c-.24.68-1.4 1.3-1.94 1.36-.5.06-1.1.09-1.77-.11-.41-.12-.93-.29-1.6-.57-2.82-1.22-4.66-4.06-4.8-4.25-.14-.19-1.15-1.53-1.15-2.92s.72-2.07.98-2.35c.24-.28.53-.34.71-.34h.5c.16 0 .38-.03.58.44.24.57.79 1.98.87 2.12.07.15.12.32.02.52-.09.19-.14.31-.28.48-.14.16-.29.36-.42.48-.14.14-.29.28-.12.56.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.61-.07.17-.19.71-.83.9-1.11.19-.28.38-.23.63-.14.26.09 1.64.77 1.92.91.28.14.47.21.53.33.07.12.07.68-.16 1.35Z" />
            </svg>
            Enviar por WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full rounded-md border border-border bg-white p-3"
      />
    </label>
  );
}
