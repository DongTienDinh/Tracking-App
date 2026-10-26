import { describe, expect, it } from "vitest";
import { habitPoints, isHabitDue } from "@/domain/scheduling";
import { scheduledDatesBetween } from "@/domain/streaks";
import { stamp } from "@/test/fixtures/app-data";

const fixedHabit = {
  id: "habit", profileId: "profile", name: "Học CV", category: "study" as const,
  scheduleType: "fixed_days" as const, weekdays: [1, 3, 5], basePoints: 20,
  minimumVersion: { label: "Đọc 15 phút", pointMultiplier: 0.5 as const },
  startDate: "2026-10-01", isActive: true, createdAt: stamp,
};

describe("habit scheduling", () => {
  it("includes only scheduled weekdays and ignores off-days", () => {
    expect(isHabitDue(fixedHabit, "2026-10-26")).toBe(true);
    expect(isHabitDue(fixedHabit, "2026-10-27")).toBe(false);
    expect(scheduledDatesBetween(fixedHabit, "2026-10-26", "2026-11-01")).toEqual([
      "2026-10-26", "2026-10-28", "2026-10-30",
    ]);
  });

  it("awards 50% points for the minimum version", () => {
    expect(habitPoints(fixedHabit, "minimum")).toBe(10);
    expect(habitPoints(fixedHabit, "standard")).toBe(20);
  });
});
