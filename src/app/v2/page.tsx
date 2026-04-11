import type { Metadata } from "next";
import AnalysisFlow from "@/components/flow/AnalysisFlow";

export const metadata: Metadata = {
  title: "cvool — Análisis y optimización de CV (v2 preview)",
  description:
    "Preview del nuevo flujo de análisis y reescritura de CV. Anónimo, sin registro.",
  robots: { index: false, follow: false },
};

export default function V2Page() {
  return <AnalysisFlow />;
}
