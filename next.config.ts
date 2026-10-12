import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // libSQL ships native bindings; keep it out of the server bundle.
  serverExternalPackages: ["@libsql/client", "libsql"],
  // Let the dev server be opened through GitHub Codespaces' forwarded URLs.
  allowedDevOrigins: ["*.app.github.dev"],
  async headers() {
    return [
      {
        // The Python runtime is ~13 MB and rarely changes; cache it for a week.
        source: "/pyodide/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
