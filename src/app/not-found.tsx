import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1>Página no encontrada</h1>
      <p className="mt-3 text-muted">El contenido que buscas no existe o fue movido.</p>
      <Link href="/" className="mt-8 inline-flex rounded-md bg-lime px-6 py-3 font-semibold text-teal-dark">
        Volver al inicio
      </Link>
    </section>
  );
}
