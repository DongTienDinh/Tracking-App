import { describe, expect, it } from "vitest";
import { activityStreak, habitStreak } from "@/domain/streaks";
import { stamp, task } from "@/test/fixtures/app-data";
import type { Habit } from "@/domain/types";

describe("habitStreak", () => {
  it("counts a weekly target completed on any three days", () => {
    const habit = { id: "h", profileId: "p", name: "Chạy", category: "fitness" as const, scheduleType: "weekly_target" as const, weeklyTarget: 3, basePoints: 10, startDate: "2026-10-01", isActive: true, createdAt: stamp };
    const logs = ["2026-10-20", "2026-10-22", "2026-10-25"].map((date, index) => ({ id: `l${index}`, profileId: "p", habitId: "h", date, completion: "standard" as const, pointsEarned: 10, completedAt: stamp }));
    expect(habitStreak(habit, logs, [], "2026-10-25")).toBe(1);
  });

  it("does not break a fixed-day streak on a recovery day", () => {
    const habit: Habit = { id: "h", profileId: "p", name: "Học", category: "study", scheduleType: "fixed_days", weekdays: [1, 3, 5], basePoints: 10, startDate: "2026-10-01", isActive: true, createdAt: stamp };
    const logs = [{ id: "l", profileId: "p", habitId: "h", date: "2026-10-23", completion: "standard" as const, pointsEarned: 10, completedAt: stamp }];
    const days = [{ profileId: "p", date: "2026-10-26", isRecoveryDay: true }];
    expect(habitStreak(habit, logs, days, "2026-10-26")).toBe(1);
  });
});

describe("activityStreak", () => {
  it("counts consecutive days with a completed task or habit", () => {
    const tasks = [
      task({ id: "t1", date: "2026-10-24", progress: 100, status: "completed" }),
      task({ id: "t2", date: "2026-10-25", progress: 100, status: "completed" }),
    ];
    const logs = [{ id: "l1", profileId: "profile-1", habitId: "h1", date: "2026-10-26", completion: "standard" as const, pointsEarned: 10, completedAt: stamp }];
    expect(activityStreak(tasks, logs, [], "2026-10-26")).toBe(3);
  });

  it("keeps yesterday's streak visible before today's first completion", () => {
    const tasks = [
      task({ id: "t1", date: "2026-10-24", progress: 100, status: "completed" }),
      task({ id: "t2", date: "2026-10-25", progress: 100, status: "completed" }),
    ];
    expect(activityStreak(tasks, [], [], "2026-10-26")).toBe(2);
  });

  it("does not increase or break on a recovery day", () => {
    const tasks = [task({ id: "t1", date: "2026-10-24", progress: 100, status: "completed" })];
    const days = [{ profileId: "profile-1", date: "2026-10-25", isRecoveryDay: true }];
    expect(activityStreak(tasks, [], days, "2026-10-26")).toBe(1);
  });
});
