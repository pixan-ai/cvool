import type { NextConfig } from "next";

const config: NextConfig = {
  // Legal consolidation (May 2026): the previous /security, /privacy, and
  // /terms pages were merged into /legal with anchored sections. Permanent
  // (308) redirects preserve SEO equity and keep external links working.
  // Per Next.js routing order, redirects are evaluated BEFORE filesystem
  // routes — so the old page.tsx files at those paths never execute.
  redirects: async () => [
    { source: "/security", destination: "/legal#security", permanent: true },
    { source: "/privacy", destination: "/legal#privacy", permanent: true },
    { source: "/terms", destination: "/legal#terms", permanent: true },
  ],
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; connect-src 'self' https://va.vercel-scripts.com https://abacus.jasoncameron.dev; img-src 'self' data:; style-src 'self' 'unsafe-inline'" },
      ],
    },
  ],
};

export default config;
