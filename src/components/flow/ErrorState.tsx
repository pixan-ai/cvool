"use client";

import { motion } from "framer-motion";
import type { ErrorReason } from "@/types/ui-state";
import { spring } from "@/lib/motion-presets";

interface Props {
  reason: ErrorReason;
  canRetry: boolean;
  onReset: () => void;
}

const COPY: Record<
  ErrorReason,
  { title: string; body: string; retry: string }
> = {
  rate_limit: {
    title: "Analizamos varios CVs desde tu conexión esta hora.",
    body: "Es un límite temporal para mantener el servicio gratuito y honesto. Intenta de nuevo en un rato.",
    retry: "Entendido",
  },
  pdf_parse: {
    title: "No pude leer tu PDF.",
    body: "Probablemente es una imagen escaneada o tiene protección. Prueba pegar el texto directamente.",
    retry: "Intentar de nuevo",
  },
  too_short: {
    title: "El CV está muy corto para analizarlo.",
    body: "Necesitamos al menos 50 caracteres para tener algo con qué trabajar.",
    retry: "Volver",
  },
  timeout: {
    title: "El análisis tardó más de lo esperado.",
    body: "Reintentar casi siempre resuelve.",
    retry: "Reintentar",
  },
  network: {
    title: "Se perdió la conexión a mitad del análisis.",
    body: "Revisa tu internet y reintenta.",
    retry: "Reintentar",
  },
  api_error: {
    title: "Algo salió mal de este lado.",
    body: "No es tu CV. Reintenta en unos segundos.",
    retry: "Reintentar",
  },
  invalid_output: {
    title: "Hubo un problema con el resultado.",
    body: "Pasa a veces con formatos inusuales. Reintentar casi siempre resuelve.",
    retry: "Reintentar",
  },
};

export default function ErrorState({ reason, canRetry, onReset }: Props) {
  const copy = COPY[reason];
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring.gentle}
        className="w-full max-w-lg text-center"
      >
        <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-full border border-ink-200">
          <span className="font-[family-name:var(--font-instrument)] text-3xl italic text-ink-700">
            !
          </span>
        </div>
        <h2 className="font-[family-name:var(--font-instrument)] text-4xl leading-tight tracking-[-0.02em] md:text-5xl">
          {copy.title}
        </h2>
        <p className="mt-6 text-ink-600">{copy.body}</p>
        <div className="mt-10 flex justify-center gap-3">
          <button
            onClick={onReset}
            className={
              canRetry
                ? "rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent"
                : "rounded-full border border-ink-200 px-6 py-3 text-sm font-medium text-ink-700 transition-colors hover:border-ink-900 hover:text-ink-900"
            }
          >
            {copy.retry}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
