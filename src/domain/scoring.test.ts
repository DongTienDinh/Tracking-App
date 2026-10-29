import { describe, expect, it } from "vitest";
import { calculateDailyScore } from "@/domain/scoring";
import { task } from "@/test/fixtures/app-data";

describe("scoring", () => {
  it("gives every task an equal share of the daily completion", () => {
    const score = calculateDailyScore([
      task({ id: "1", progress: 100, status: "completed" }),
      task({ id: "2", progress: 0, status: "planned" }),
      task({ id: "3", progress: 0, status: "planned" }),
    ]);
    expect(score.percent).toBeCloseTo(100 / 3);
  });

  it("uses partial checklist progress in the daily percentage", () => {
    const score = calculateDailyScore([
      task({ id: "1", progress: 50, status: "in_progress" }),
      task({ id: "2", progress: 100, status: "completed" }),
    ]);
    expect(score.percent).toBe(75);
  });

  it("does not score deferred tasks twice", () => {
    const original = task({ id: "old", status: "deferred", deferredTo: "2026-10-26", progress: 0 });
    const next = task({ id: "new", date: "2026-10-26", status: "completed", progress: 100, isTopPriority: false });
    expect(calculateDailyScore([original]).planned).toBe(0);
    expect(calculateDailyScore([original]).earned).toBe(0);
    expect(calculateDailyScore([next]).percent).toBe(100);
  });
});
