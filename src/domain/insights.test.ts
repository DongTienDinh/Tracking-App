import { describe, expect, it } from "vitest";
import { buildDailyInsights } from "@/domain/insights";
import { task } from "@/test/fixtures/app-data";

describe("insights aggregation", () => {
  it("aggregates 10,000 tasks within the 200ms budget", () => {
    const tasks = Array.from({ length: 10_000 }, (_, index) => task({
      id: `task-${index}`,
      taskChainId: `chain-${index}`,
      date: `2026-10-${String((index % 25) + 1).padStart(2, "0")}`,
      progress: index % 2 === 0 ? 100 : 50,
      status: index % 2 === 0 ? "completed" : "in_progress",
    }));

    const startedAt = performance.now();
    const result = buildDailyInsights(tasks, [], [], new Date("2026-10-25T12:00:00"), 30);
    const duration = performance.now() - startedAt;

    expect(result).toHaveLength(30);
    expect(result.reduce((sum, day) => sum + day.total, 0)).toBe(10_000);
    expect(duration).toBeLessThan(200);
  });
});
