import "server-only";
import { SITE } from "./site";

/**
 * Transactional email via Resend (https://resend.com) when RESEND_API_KEY is set.
 * Without it (development), emails are printed to the server console instead.
 *   EMAIL_FROM   e.g. "Techniance <hello@techniance.com>" (domain must be verified in Resend)
 */
export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.info(`[email:dev] to=${to} subject=${JSON.stringify(subject)}\n${text}`);
    return true;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM ?? `${SITE.name} <no-reply@techniance.com>`, to, subject, text, html }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error(`[email] Resend responded ${res.status}: ${await res.text().catch(() => "")}`);
    return res.ok;
  } catch (e) {
    console.error("[email] send failed", e);
    return false;
  }
}

/** Minimal branded HTML wrapper for transactional emails. */
export function emailHtml(heading: string, paragraphs: string[], cta?: { label: string; url: string }) {
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  return `<!doctype html><html><body style="margin:0;background:#f6f6fb;font-family:Arial,Helvetica,sans-serif;color:#191b31">
<div style="max-width:520px;margin:0 auto;padding:32px 20px">
<div style="font-size:22px;font-weight:800;color:#7c5cff;margin-bottom:24px">techniance</div>
<div style="background:#fff;border:2px solid #e1e3ef;border-radius:16px;padding:28px">
<h1 style="font-size:22px;margin:0 0 12px">${esc(heading)}</h1>
${paragraphs.map((p) => `<p style="font-size:15px;line-height:1.6;margin:0 0 12px">${esc(p)}</p>`).join("")}
${cta ? `<p style="margin:24px 0 8px"><a href="${esc(cta.url)}" style="background:#7c5cff;color:#fff;text-decoration:none;font-weight:800;padding:12px 22px;border-radius:12px;display:inline-block">${esc(cta.label)}</a></p>` : ""}
</div>
<p style="font-size:12px;color:#636887;margin-top:20px">${esc(SITE.name)} · <a href="${esc(SITE.url)}/settings" style="color:#636887">Email preferences</a></p>
</div></body></html>`;
}
