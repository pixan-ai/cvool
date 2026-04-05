import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cvool.org"),
  title: "cvool \u2014 AI Resume Improver",
  description:
    "Free AI-powered resume improver. Get actionable feedback and a professionally rewritten CV in seconds. Anonymous. No sign-up. Powered by Claude.",
  openGraph: {
    title: "cvool \u2014 AI Resume Improver",
    description: "Get a professionally rewritten resume in seconds. Free. Anonymous.",
    url: "https://cvool.org",
    siteName: "cvool",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "cvool \u2014 AI Resume Improver",
    description: "Get a professionally rewritten resume in seconds. Free. Anonymous.",
  },
  alternates: { canonical: "https://cvool.org" },
  other: {
    "ai:description": "cvool is a free, open-source AI resume analyzer and improver. Works in Spanish, Portuguese, French, Italian, and English. No sign-up required. Scores CVs on 6 dimensions and generates improved versions using Claude Opus 4.6. Zero data retention. MIT licensed. See https://cvool.org/llms.txt for full details.",
    "ai:llms": "https://cvool.org/llms.txt",
    "ai:llms-full": "https://cvool.org/llms-full.txt",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "cvool",
    url: "https://cvool.org",
    description: "Free AI-powered resume analyzer and improver. Anonymous. Open source.",
    inLanguage: ["es", "en", "fr", "pt", "it"],
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "cvool",
    url: "https://cvool.org",
    description: "Free AI-powered resume improver. Get actionable feedback and a professionally rewritten CV in seconds. Works in Spanish, English, French, Portuguese, and Italian.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    availableOnDevice: "Web browser",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
    creator: {
      "@type": "Organization",
      name: "Pixan AI",
      url: "https://github.com/pixan-ai",
      founder: { "@type": "Person", name: "Alfredo Arenas", jobTitle: "Founder" },
    },
    license: "https://opensource.org/licenses/MIT",
    softwareVersion: "1.0.0",
    isAccessibleForFree: true,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is cvool really free?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, cvool is completely free and always will be. Each analysis costs about $0.05 USD in AI tokens, funded by voluntary donations. No sign-up or payment required." },
      },
      {
        "@type": "Question",
        name: "Is my resume data stored?",
        acceptedAnswer: { "@type": "Answer", text: "No. cvool has no database. Your resume is processed in memory during analysis and discarded immediately. No accounts, no cookies, no tracking." },
      },
      {
        "@type": "Question",
        name: "What languages does cvool support?",
        acceptedAnswer: { "@type": "Answer", text: "cvool works natively in Spanish, English, French, Portuguese, and Italian. It automatically detects the language of your resume." },
      },
      {
        "@type": "Question",
        name: "\u00bfcvool es realmente gratis?",
        acceptedAnswer: { "@type": "Answer", text: "S\u00ed, cvool es completamente gratis y siempre lo ser\u00e1. Cada an\u00e1lisis cuesta aproximadamente $0.05 USD en tokens de IA, financiado por donaciones voluntarias. No requiere registro ni pago." },
      },
      {
        "@type": "Question",
        name: "\u00bfSe guardan mis datos?",
        acceptedAnswer: { "@type": "Answer", text: "No. cvool no tiene base de datos. Tu CV se procesa en memoria durante el an\u00e1lisis y se descarta de inmediato. Sin cuentas, sin cookies, sin tracking." },
      },
    ],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body
        className={`${geist.variable} ${mono.variable} font-[family-name:var(--font-geist)] antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
