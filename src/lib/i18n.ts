import home from "@/content/home.json";

export type Lang = keyof typeof home;
export type UI = typeof home.es;

export function t(lang: Lang): UI {
  return home[lang] ?? home.es;
}

export function dimName(key: string, lang: Lang): string {
  return (home[lang]?.dim as Record<string, string>)?.[key] ?? key;
}
