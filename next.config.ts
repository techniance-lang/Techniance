import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const analyticsHost = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST ?? "https://plausible.io";

// Code runners need eval (JS worker builds functions) and WebAssembly (Python, SQLite).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'${process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? ` ${analyticsHost}` : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? ` ${analyticsHost}` : ""}`,
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  ...(isProd
    ? [
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "Content-Security-Policy", value: csp },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // libSQL ships native bindings; keep it out of the server bundle.
  serverExternalPackages: ["@libsql/client", "libsql"],
  // Let the dev server be opened through GitHub Codespaces' forwarded URLs.
  allowedDevOrigins: ["*.app.github.dev"],
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // The Python runtime is ~13 MB and rarely changes; cache it for a week.
        source: "/pyodide/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      {
        source: "/sqljs/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
