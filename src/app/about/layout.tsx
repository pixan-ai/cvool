import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
export const metadata: Metadata = pageMetadata(
  "about",
  "Sobre m\u00ed",
  "About",
  "Qui\u00e9n est\u00e1 detr\u00e1s de cvool, la misi\u00f3n y los valores del proyecto.",
  "Who\u2019s behind cvool, the mission, and project values.",
  "cvool is a one-person project by Alfredo Arenas (Pixan.ai, Mexico City). Built to provide free, anonymous resume analysis in Spanish and any language. Open source, MIT licensed. No startup, no funding — just an Anthropic API key and stubbornness."
);
export { default } from "./page";
