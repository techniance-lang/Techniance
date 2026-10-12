// Pure entitlement checks shared by server and client. "billingEnabled" comes
// from the server (lib/billing/stripe.ts): without payments configured nothing
// is locked, so self-hosted and development setups get every feature.
import type { Difficulty, Level } from "@/content/types";
import { FREE_TIER } from "./plans";

export interface PlanState {
  proUntil: number;
}

/** Grace period after a renewal date while Stripe retries a payment. */
const GRACE_MS = 3 * 24 * 60 * 60 * 1000;

export function isPro(user: PlanState | null | undefined, now = Date.now()): boolean {
  return !!user && user.proUntil + GRACE_MS > now;
}

export interface Access {
  billingEnabled: boolean;
  pro: boolean;
}

export function accessFor(user: PlanState | null | undefined, billingEnabled: boolean, now = Date.now()): Access {
  return { billingEnabled, pro: isPro(user, now) };
}

/** Content is open to everyone when billing is off, and to Pro members always. */
const open = (a: Access) => !a.billingEnabled || a.pro;

export const canAccessLevel = (a: Access, level: Level) => open(a) || FREE_TIER.levels.includes(level);
export const canAccessProblem = (a: Access, difficulty: Difficulty) => open(a) || FREE_TIER.problemDifficulties.includes(difficulty);
/** Pro members never run out of hearts. (Without billing, hearts still apply — they're part of the game.) */
export const hasUnlimitedHearts = (a: Access) => a.billingEnabled && a.pro;
export const canEarnCertificates = (a: Access) => open(a);
