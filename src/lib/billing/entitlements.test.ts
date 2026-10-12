import { describe, expect, it } from "vitest";
import { accessFor, canAccessLevel, canAccessProblem, canAccessUnit, hasUnlimitedHearts, isPro } from "./entitlements";

const DAY = 24 * 60 * 60 * 1000;

describe("entitlements", () => {
  const now = 1_800_000_000_000;
  it("treats proUntil in the future as Pro, with no grace after it ends", () => {
    expect(isPro({ proUntil: now + DAY }, now)).toBe(true);
    expect(isPro({ proUntil: now - 1 }, now)).toBe(false);
    expect(isPro({ proUntil: 0 }, now)).toBe(false);
  });

  it("keeps the first unit of every course free", () => {
    const free = accessFor({ proUntil: 0 }, true, now);
    expect(canAccessUnit(free, { level: "Intermediate" }, 0)).toBe(true);
    expect(canAccessUnit(free, { level: "Intermediate" }, 1)).toBe(false);
    expect(canAccessUnit(free, { level: "Beginner" }, 3)).toBe(true);
  });

  it("opens everything when billing is disabled", () => {
    const a = accessFor({ proUntil: 0 }, false, now);
    expect(canAccessLevel(a, "Advanced")).toBe(true);
    expect(canAccessProblem(a, "hard")).toBe(true);
    expect(hasUnlimitedHearts(a)).toBe(false);
  });

  it("limits free users to Beginner units and easy problems when billing is on", () => {
    const free = accessFor({ proUntil: 0 }, true, now);
    expect(canAccessLevel(free, "Beginner")).toBe(true);
    expect(canAccessLevel(free, "Intermediate")).toBe(false);
    expect(canAccessProblem(free, "easy")).toBe(true);
    expect(canAccessProblem(free, "medium")).toBe(false);
    const pro = accessFor({ proUntil: now + 30 * DAY }, true, now);
    expect(canAccessLevel(pro, "Advanced")).toBe(true);
    expect(hasUnlimitedHearts(pro)).toBe(true);
  });
});
