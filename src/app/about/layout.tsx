import { pageMeta } from "@/lib/metadata";
export const metadata = pageMeta(
  "about",
  ["Sobre mí", "About"],
  ["Quién está detrás de cvool, la misión y los valores del proyecto.", "Who's behind cvool, the mission, and project values."],
  "cvool is a one-person project by Alfredo Arenas (Pixan.ai, Mexico City). Built to provide free, anonymous resume analysis in Spanish and any language. Open source, MIT licensed. No startup, no funding — just an Anthropic API key and stubbornness.",
);
export { default } from "./page";
