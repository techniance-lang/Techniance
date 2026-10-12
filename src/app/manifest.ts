import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Techniance",
    short_name: "Techniance",
    description: "Learn to code with bite-sized lessons, coding challenges, streaks and XP.",
    start_url: "/learn",
    display: "standalone",
    background_color: "#0d0f1e",
    theme_color: "#7c5cff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
