import home from "@/content/home.json";

export type Lang = keyof typeof home;
export type UI = typeof home.es;

export function t(lang: Lang): UI {
  return home[lang] ?? home.es;
}

// localStorage can throw (blocked cookies, strict private mode, some
// webviews) — a language preference must never crash the UI.
export const langStore = {
  get: () => { try { return localStorage.getItem("lang"); } catch { return null; } },
  set: (l: string) => { try { localStorage.setItem("lang", l); } catch { /* preference simply not persisted */ } },
};

export function dimName(key: string, lang: Lang): string {
  return (home[lang]?.dim as Record<string, string>)?.[key] ?? key;
}
