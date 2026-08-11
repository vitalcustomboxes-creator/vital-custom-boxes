import type { NextConfig } from "next";
import { redirects } from "./lib/redirects";

/**
 * ARCHITECT decision: next.config.ts (TypeScript) instead of next.config.mjs.
 * Rationale: Next 15 supports TS config natively and it lets us import the
 * typed redirect table from ./lib/redirects.ts (owned by SEO-1) directly —
 * an .mjs config cannot import .ts modules. Documented in docs/ARCHITECTURE.md.
 */
const nextConfig: NextConfig = {
  // Keep dev and production artifacts isolated. Running `next dev` after a
  // production build must not rewrite `.next` vendor chunks.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  reactStrictMode: true,
  // Keep server-side packages from being bundled
  serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose"],
  // The email sender reads this image at runtime and embeds it as a CID
  // attachment. Explicit tracing guarantees Vercel includes it in functions.
  outputFileTracingIncludes: {
    "/*": ["./public/vital-logo-email.png"],
  },
  experimental: {
    serverActions: {
      // Quote artwork permits up to 5 × 10 MB files. Allow a small margin for
      // multipart field metadata; lib/lead-artwork.ts still validates every
      // file's count, extension and size before anything reaches R2.
      bodySizeLimit: "55mb",
    },
  },
  // QA-AUTO 2026-06-12 (SECURITY ISSUE, S3): drop the default
  // `X-Powered-By: Next.js` response header (framework fingerprinting).
  poweredByHeader: false,

  trailingSlash: true,
  images: {

    unoptimized: process.env.NEXT_DISABLE_IMAGE_OPT === "1",
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {

    return redirects;
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // No MIME-sniffing — assets are served with correct types.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Site is never embedded in frames (no embeds in IA) → DENY.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Minimal Permissions-Policy: the site uses none of these features.
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
          },
          // HSTS — meaningful in production over HTTPS only (browsers ignore
          // it on plain-HTTP localhost). 2 years, no includeSubDomains for
          // now: client may run unrelated subdomains on the old host; revisit
          // (+preload) with SECURITY at cutover. NOTE: Vercel also injects
          // HSTS on HTTPS domains; this keeps parity for non-Vercel hosting.
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          // Content-Security-Policy. Inventory of inline code that must be
          // allowed: (1) the `data-js` bootstrap script in the root layout,
          // (2) per-page JSON-LD <script type="application/ld+json"> blocks,
          // (3) Tailwind/inline styles. JSON-LD is dynamic per page, so a
          // header-level policy uses 'unsafe-inline' for script/style rather
          // than hashes (a per-request nonce via middleware is the future
          // hardening path). Browser connections are otherwise same-origin,
          // with explicit Firebase Auth, token-refresh, and Firestore origins.
          // Images allow https (CDN + /_next/image); no third-party JS loads.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "frame-src 'self' https://*.firebaseapp.com https://*.tawk.to",
              "form-action 'self'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://embed.tawk.to",
              "style-src 'self' 'unsafe-inline' https://embed.tawk.to",
              `script-src 'self' 'unsafe-inline' blob: https://apis.google.com https://www.googletagmanager.com https://embed.tawk.to${process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ""}`,
              `connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://apis.google.com https://www.google-analytics.com https://www.googletagmanager.com https://*.tawk.to wss://*.tawk.to${process.env.NODE_ENV !== 'production' ? " ws: wss:" : ""}`,
              "manifest-src 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;