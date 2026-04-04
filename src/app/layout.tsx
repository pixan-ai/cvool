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
  title: "cvool — AI Resume Improver",
  description:
    "Free AI-powered resume improver. Get actionable feedback and a professionally rewritten CV in seconds. Anonymous. No sign-up. Powered by Claude.",
  openGraph: {
    title: "cvool — AI Resume Improver",
    description: "Get a professionally rewritten resume in seconds. Free. Anonymous.",
    url: "https://cvool.org",
    siteName: "cvool",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "cvool — AI Resume Improver",
    description: "Get a professionally rewritten resume in seconds. Free. Anonymous.",
  },
  alternates: { canonical: "https://cvool.org" },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "cvool",
  url: "https://cvool.org",
  description:
    "Free AI-powered resume improver. Get actionable feedback and a professionally rewritten CV.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  creator: { "@type": "Organization", name: "Pixan AI", url: "https://github.com/pixan-ai" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
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
