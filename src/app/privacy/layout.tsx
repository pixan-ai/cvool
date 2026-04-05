import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
export const metadata: Metadata = pageMetadata(
  "privacy",
  "Privacidad",
  "Privacy",
  "Aviso de privacidad de cvool: c\u00f3mo tratamos tus datos (spoiler: no los guardamos).",
  "cvool privacy notice: how we handle your data (spoiler: we don\u2019t store it).",
  "cvool privacy: zero data retention. No database, no accounts, no tracking cookies. Compliant by design with LFPDPPP (Mexico), GDPR (EU), LGPD (Brazil), CCPA (California), PIPEDA (Canada). ARCO rights fulfilled — no data to access, rectify, cancel, or oppose. Contact: security@cvool.org."
);
export { default } from "./page";
