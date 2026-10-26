import { describe, expect, it } from "vitest";
import { goalProgress } from "@/domain/goals";
import { stamp } from "@/test/fixtures/app-data";

describe("goalProgress", () => {
  it("uses milestone weights", () => {
    const progress = goalProgress({
      id: "g", profileId: "p", title: "Đồ án CV", startDate: "2026-10-01", status: "active", createdAt: stamp, updatedAt: stamp,
      milestones: [
        { id: "a", title: "Baseline", weight: 2, isCompleted: true, completedAt: stamp },
        { id: "b", title: "Ablation", weight: 3, isCompleted: false },
      ],
    });
    expect(progress).toBe(40);
  });
});
