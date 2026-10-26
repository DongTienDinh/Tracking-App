import { describe, expect, it } from "vitest";
import { buildCheckpointSummary, isCheckpointDue } from "@/domain/checkpoint";
import { task } from "@/test/fixtures/app-data";

describe("midday checkpoint", () => {
  it("becomes due at the configured local time", () => {
    expect(isCheckpointDue(new Date(2026, 9, 26, 11, 59), "12:00")).toBe(false);
    expect(isCheckpointDue(new Date(2026, 9, 26, 12, 0), "12:00")).toBe(true);
  });

  it("shows encouragement after noon when no task is checked", () => {
    const summary = buildCheckpointSummary(
      [task({ id: "task-1" }), task({ id: "task-2" })],
      new Date(2026, 9, 26, 12, 5),
      "12:00",
      false,
    );
    expect(summary.attention).toBe("due-empty");
    expect(summary.message).toContain("Đừng bỏ cuộc");
  });

  it("reports every completed task in the daily checklist", () => {
    const summary = buildCheckpointSummary(
      [task({ id: "task-1", progress: 100, status: "completed" }), task({ id: "task-2" }), task({ id: "task-3", progress: 100, status: "completed" }), task({ id: "task-4" })],
      new Date(2026, 9, 26, 12, 5),
      "12:00",
      false,
    );
    expect(summary.attention).toBe("due-progress");
    expect(summary.completed).toBe(2);
    expect(summary.total).toBe(4);
  });
});
