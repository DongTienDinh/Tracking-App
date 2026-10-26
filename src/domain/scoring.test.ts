import { describe, expect, it } from "vitest";
import { calculateDailyScore, earnedTaskPoints } from "@/domain/scoring";
import { task } from "@/test/fixtures/app-data";

describe("scoring", () => {
  it("awards 10 then 20 points for an important task at 50% and 100%", () => {
    expect(earnedTaskPoints(task({ progress: 50, status: "in_progress" }))).toBe(10);
    expect(earnedTaskPoints(task({ progress: 100, status: "completed" }))).toBe(20);
  });

  it("caps daily penalties at minus 10", () => {
    const tasks = [
      task({ id: "1", status: "skipped", priority: "critical", isTopPriority: false }),
      task({ id: "2", status: "skipped", priority: "critical", isTopPriority: false }),
    ];
    expect(calculateDailyScore(tasks).penalty).toBe(-10);
    expect(calculateDailyScore(tasks).earned).toBe(-10);
  });

  it("does not score deferred tasks twice", () => {
    const original = task({ id: "old", status: "deferred", deferredTo: "2026-10-26", progress: 0 });
    const next = task({ id: "new", date: "2026-10-26", status: "completed", progress: 100, isTopPriority: false });
    expect(calculateDailyScore([original]).planned).toBe(0);
    expect(calculateDailyScore([original]).earned).toBe(0);
    expect(calculateDailyScore([next]).earned).toBe(20);
  });

  it("removes penalties on a recovery day", () => {
    const skipped = task({ status: "skipped", priority: "critical" });
    expect(calculateDailyScore([skipped], { profileId: "profile-1", date: skipped.date, isRecoveryDay: true }).penalty).toBe(0);
  });
});
