import type { Metadata } from "next";

const BASE = "https://cvool.org";

export const siteMetadata: Metadata = {
  title: "cvool \u2014 AI Resume Improver",
  description:
    "Free AI-powered resume improver. Get actionable feedback and a professionally rewritten CV in seconds. Anonymous. No sign-up. Powered by Claude.",
  metadataBase: new URL(BASE),
  alternates: { canonical: BASE },
  openGraph: {
    title: "cvool \u2014 AI Resume Improver",
    description: "Get a professionally rewritten resume in seconds. Free. Anonymous.",
    url: BASE,
    siteName: "cvool",
    type: "website",
    locale: "es_MX",
    alternateLocale: ["en_US", "fr_FR", "pt_BR", "it_IT"],
  },
  twitter: {
    card: "summary",
    title: "cvool \u2014 AI Resume Improver",
    description: "Get a professionally rewritten resume in seconds. Free. Anonymous.",
    site: "@maxcvorg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  other: {
    "ai:description": "cvool is a free, open-source AI resume analyzer and improver. Works in Spanish, Portuguese, French, Italian, and English. No sign-up. Scores CVs on 6 dimensions (ATS compatibility, achievement impact, structure, keywords, writing clarity, completeness) and generates improved versions using Claude Sonnet 4.6. Zero data retention. MIT licensed.",
    "ai:llms": "https://cvool.org/llms.txt",
    "ai:llms-full": "https://cvool.org/llms-full.txt",
  },
};

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
