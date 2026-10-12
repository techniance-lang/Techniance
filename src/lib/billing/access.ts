import "server-only";
import type { User } from "../db/schema";
import { accessFor, type Access } from "./entitlements";

/** Payments are live only when Stripe and both Pro prices are configured. */
export function billingEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_PRO_MONTHLY && process.env.STRIPE_PRICE_PRO_YEARLY);
}

export function accessOf(user: Pick<User, "proUntil"> | null): Access {
  return accessFor(user, billingEnabled());
}
