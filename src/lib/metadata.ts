import type { Metadata } from "next";

const BASE = "https://cvool.org";

export const siteMetadata: Metadata = {
  title: "cvool \u2014 AI Resume Improver",
  description: "Free AI-powered resume improver. Get actionable feedback and a professionally rewritten CV in seconds. Anonymous. No sign-up. Powered by Claude.",
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
    "ai:description": "cvool is a free, open-source AI resume analyzer. No sign-up. Scores CVs on 6 dimensions and generates improved versions using Claude Opus 4.6.",
  },
};

export function pageMetadata(page: string, titleEs: string, titleEn: string, descEs: string, descEn: string): Metadata {
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
  };
}
