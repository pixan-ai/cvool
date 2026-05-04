import type { Metadata } from "next";

const BASE = "https://cvool.org";

export function pageMeta(
  page: string,
  t: [string, string],
  d: [string, string],
  ai?: string,
): Metadata {
  const url = `${BASE}/${page}`;
  return {
    title: `${t[0]} | cvool`,
    description: d[0],
    alternates: { canonical: url },
    openGraph: { title: `${t[1]} | cvool`, description: d[1], url, siteName: "cvool", type: "website" },
    ...(ai ? { other: { "ai:description": ai } } : {}),
  };
}
