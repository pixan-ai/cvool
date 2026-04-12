import type { Metadata } from "next";

const BASE = "https://cvool.org";

export function pageMetadata(
  page: string,
  titleEs: string,
  titleEn: string,
  descEs: string,
  descEn: string,
  aiDesc?: string,
): Metadata {
  return {
    title: `${titleEs} | cvool`,
    description: descEs,
    alternates: { canonical: `${BASE}/${page}` },
    openGraph: {
      title: `${titleEn} | cvool`,
      description: descEn,
      url: `${BASE}/${page}`,
      siteName: "cvool",
      type: "website",
    },
    ...(aiDesc
      ? { other: { "ai:description": aiDesc } }
      : {}),
  };
}
