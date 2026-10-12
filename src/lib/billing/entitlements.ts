// Pure entitlement checks shared by server and client. "billingEnabled" comes
// from the server (lib/billing/access.ts): without payments configured nothing
// is locked, so self-hosted and development setups get every feature.
import type { Difficulty, Level } from "@/content/types";
import { FREE_TIER } from "./plans";

export interface PlanState {
  proUntil: number;
}

/**
 * Pro while proUntil is in the future. The Stripe webhook keeps proUntil at the
 * subscription's period end (past_due subscriptions keep access while Stripe
 * retries) and sets it to "now" when a subscription ends — so no extra grace here.
 */
export function isPro(user: PlanState | null | undefined, now = Date.now()): boolean {
  return !!user && user.proUntil > now;
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
/** The first unit of every course is always free (so courses that start at Intermediate still have a free taster). */
export const canAccessUnit = (a: Access, unit: { level: Level }, unitIndex: number) => unitIndex === 0 || canAccessLevel(a, unit.level);
export const canAccessProblem = (a: Access, difficulty: Difficulty) => open(a) || FREE_TIER.problemDifficulties.includes(difficulty);
/** Pro members never run out of hearts. (Without billing, hearts still apply — they're part of the game.) */
export const hasUnlimitedHearts = (a: Access) => a.billingEnabled && a.pro;
export const canEarnCertificates = (a: Access) => open(a);
