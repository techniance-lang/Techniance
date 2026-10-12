// Site-wide settings read from the environment, with safe development defaults.
export const SITE = {
  name: "Techniance",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@techniance.com",
  salesEmail: process.env.NEXT_PUBLIC_SALES_EMAIL ?? process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "sales@techniance.com",
  /** Legal entity shown in Terms/Privacy. Set before launch. */
  company: process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Techniance",
};

/** Comma-separated ADMIN_EMAILS can open /admin. Server-only. */
export function isAdminEmail(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
