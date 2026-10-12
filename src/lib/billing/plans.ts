// The revenue model in one place: plans, prices, what's free vs Pro, and gem packs.
// Prices here are for display; the amount charged is whatever the Stripe Price
// (STRIPE_PRICE_* env vars) says, so keep them in sync in the Stripe dashboard.
import type { Level } from "@/content/types";
import type { Difficulty } from "@/content/types";

export type Interval = "month" | "year";

export const PRO = {
  name: "Techniance Pro",
  trialDays: 7,
  prices: {
    month: { amount: 9.99, label: "$9.99", per: "month", priceEnv: "STRIPE_PRICE_PRO_MONTHLY" },
    year: { amount: 79.99, label: "$79.99", per: "year", perMonthLabel: "$6.67", priceEnv: "STRIPE_PRICE_PRO_YEARLY", savePercent: 33 },
  },
} as const;

/** What a free account can reach. Everything else needs Pro (only when billing is enabled). */
export const FREE_TIER = {
  levels: ["Beginner"] as Level[],
  problemDifficulties: ["easy"] as Difficulty[],
  maxHearts: 5,
};

export const PRO_FEATURES = [
  { icon: "🔓", title: "Every course, every level", body: "Unlock all Intermediate and Advanced units in all 10 courses." },
  { icon: "❤️", title: "Unlimited hearts", body: "Mistakes are how you learn — keep going without waiting." },
  { icon: "🧩", title: "The full practice arena", body: "Medium and hard contest problems in 7 languages." },
  { icon: "🎓", title: "Certificates", body: "Earn a shareable certificate when you finish a course." },
  { icon: "🛡️", title: "Weekly streak freeze", body: "A free streak freeze every week to protect your streak." },
  { icon: "💜", title: "Pro badge", body: "Stand out on leaderboards and your profile." },
] as const;

export interface GemPack {
  id: string;
  gems: number;
  amount: number;
  label: string;
  bonus?: string;
  priceEnv: string;
}

export const GEM_PACKS: GemPack[] = [
  { id: "gems-600", gems: 600, amount: 4.99, label: "$4.99", priceEnv: "STRIPE_PRICE_GEMS_600" },
  { id: "gems-1500", gems: 1500, amount: 9.99, label: "$9.99", bonus: "+25% bonus", priceEnv: "STRIPE_PRICE_GEMS_1500" },
  { id: "gems-4000", gems: 4000, amount: 19.99, label: "$19.99", bonus: "+67% bonus", priceEnv: "STRIPE_PRICE_GEMS_4000" },
];

export const TEAMS = {
  name: "Techniance for Teams & Schools",
  blurb: "Seats for classrooms, bootcamps and engineering teams, with progress dashboards and invoicing.",
  from: "$8 per seat / month",
  contact: "sales",
};
