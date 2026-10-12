import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", weight: ["400", "600", "700", "800", "900"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: { default: "Techniance — Learn to code, one streak at a time", template: "%s · Techniance" },
  description:
    "Bite-sized coding lessons, real coding challenges that run in your browser, daily streaks, XP, leagues and achievements. Learn Python, JavaScript and algorithms.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0f1e" },
  ],
};

// Applies the saved (or system) theme before first paint to avoid a flash.
const themeScript = `(() => {
  try {
    const saved = localStorage.getItem("theme");
    const theme = saved === "light" || saved === "dark" ? saved
      : matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
  } catch { document.documentElement.dataset.theme = "dark"; }
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${nunito.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
