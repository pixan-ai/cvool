"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, stagger, duration, easing } from "@/lib/motion-presets";

interface Props {
  initial?: { cvText: string; targetRole: string };
  onSubmit: (cvText: string, targetRole: string) => void;
  onEdit: (cvText: string, targetRole: string) => void;
}

export default function UploadScreen({ initial, onSubmit, onEdit }: Props) {
  const [cvText, setCvText] = useState(initial?.cvText ?? "");
  const [targetRole, setTargetRole] = useState(initial?.targetRole ?? "");
  const [parsing, setParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const ready = cvText.trim().length >= 50 && !parsing;

  const updateCv = (text: string) => {
    setCvText(text);
    onEdit(text, targetRole);
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        setPdfError("Solo PDF por ahora. Si es otro formato, pega el texto.");
        return;
      }
      setParsing(true);
      setPdfError(null);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/parse", { method: "POST", body: fd });
        if (!res.ok) {
          setPdfError("No pude leer el PDF. Prueba exportar como texto.");
          return;
        }
        const data = await res.json();
        if (data.text?.trim().length > 10) {
          setCvText(data.text);
          onEdit(data.text, targetRole);
        } else {
          setPdfError("El PDF parece vacío o es una imagen. Pega el texto.");
        }
      } catch {
        setPdfError("Algo salió mal leyendo el PDF.");
      } finally {
        setParsing(false);
      }
    },
    [onEdit, targetRole],
  );

  return (
    <div
      className="mx-auto max-w-3xl px-6 py-14 md:py-24"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      <motion.div variants={stagger(0.08)} initial="initial" animate="enter">
        <motion.h1
          variants={fadeUp}
          className="font-[family-name:var(--font-instrument)] text-5xl leading-[0.95] tracking-[-0.04em] md:text-7xl"
        >
          Convierte tu CV en uno
          <br />
          <span className="italic text-accent">
            que el recruiter no pueda ignorar.
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-8 max-w-xl text-lg leading-relaxed text-ink-600 md:text-xl"
        >
          Análisis honesto y un CV reescrito, en segundos. Anónimo, sin
          registro, cero datos guardados.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-12">
          <label
            htmlFor="cv-input"
            className={`block rounded-2xl border-2 border-dashed p-6 transition-all ${
              isDragging
                ? "scale-[1.01] border-accent bg-accent-ghost"
                : "border-ink-100 bg-ink-050"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-ink-400">
                Tu CV
              </span>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={parsing}
                className="rounded-full border border-ink-200 px-3 py-1 text-xs font-medium text-ink-700 hover:border-ink-900 hover:text-ink-900 disabled:opacity-40"
              >
                {parsing ? "Leyendo PDF…" : "Subir PDF"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
            <textarea
              id="cv-input"
              value={cvText}
              onChange={(e) => updateCv(e.target.value)}
              placeholder="Arrastra un PDF aquí o pega el texto de tu CV…"
              className="h-56 w-full resize-none bg-transparent text-base leading-relaxed text-ink-900 placeholder:text-ink-300 focus:outline-none md:text-[17px]"
            />
            <div className="mt-2 flex items-center justify-between font-[family-name:var(--font-mono)] text-[11px] text-ink-400">
              <span>
                {cvText.length.toLocaleString()} / 35,000 caracteres
              </span>
              {cvText.trim().length > 0 && cvText.trim().length < 50 && (
                <span className="text-ink-600">Mínimo 50 caracteres</span>
              )}
            </div>
          </label>
          {pdfError && (
            <p
              role="alert"
              aria-live="polite"
              className="mt-3 text-sm text-ink-700"
            >
              {pdfError}
            </p>
          )}
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-6 flex flex-col gap-3 md:flex-row"
        >
          <input
            type="text"
            value={targetRole}
            onChange={(e) => {
              setTargetRole(e.target.value);
              onEdit(cvText, e.target.value);
            }}
            placeholder="¿Rol objetivo? (opcional)"
            maxLength={200}
            className="flex-1 rounded-full border border-ink-200 bg-white px-5 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-ink-900 focus:outline-none"
          />
          <motion.button
            type="button"
            disabled={!ready}
            onClick={() => onSubmit(cvText, targetRole)}
            whileHover={ready ? { scale: 1.015 } : undefined}
            whileTap={ready ? { scale: 0.98 } : undefined}
            transition={{ duration: duration.quick, ease: easing.out }}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-ink-300"
          >
            Analizar
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </motion.button>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-20 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ink-100 pt-8 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-ink-400"
        >
          <span>Honesto</span>
          <span>·</span>
          <span>Anónimo</span>
          <span>·</span>
          <span>5 idiomas</span>
          <span>·</span>
          <span>Open source</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
