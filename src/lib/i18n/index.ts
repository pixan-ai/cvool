import es from "./es.json";
import en from "./en.json";
import fr from "./fr.json";
import pt from "./pt.json";
import it from "./it.json";

export type Lang = "es" | "en" | "fr" | "pt" | "it";
export type UI = typeof es;

const strings: Record<Lang, UI> = { es, en, fr, pt, it };

export function t(lang: Lang): UI {
  return strings[lang] ?? strings.es;
}

export function dimName(key: string, lang: Lang): string {
  return (strings[lang]?.dim as Record<string, string>)?.[key] ?? key;
}
