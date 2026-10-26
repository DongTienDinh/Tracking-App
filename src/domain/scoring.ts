import type { DailyTask, DayMeta, Priority } from "@/domain/types";

export const PRIORITY_POINTS: Record<Priority, number> = {
  normal: 5,
  medium: 10,
  important: 20,
  critical: 30,
};

export const SKIP_PENALTY: Record<Priority, number> = {
  normal: 0,
  medium: -2,
  important: -5,
  critical: -8,
};

export function earnedTaskPoints(task: DailyTask, recoveryDay = false): number {
  if (task.status === "deferred") return 0;
  if (task.status === "skipped") return recoveryDay ? 0 : SKIP_PENALTY[task.priority];
  return PRIORITY_POINTS[task.priority] * (task.progress / 100);
}

export function plannedTaskPoints(task: DailyTask): number {
  return task.status === "deferred" ? 0 : PRIORITY_POINTS[task.priority];
}

export interface DailyScore {
  earned: number;
  planned: number;
  percent: number;
  completed: number;
  total: number;
  penalty: number;
}

export function calculateDailyScore(tasks: DailyTask[], day?: DayMeta): DailyScore {
  let positive = 0;
  let rawPenalty = 0;
  let planned = 0;
  let completed = 0;
  const relevant = tasks.filter((task) => task.status !== "deferred");
  for (const task of tasks) {
    planned += plannedTaskPoints(task);
    const score = earnedTaskPoints(task, day?.isRecoveryDay ?? false);
    if (score < 0) rawPenalty += score;
    else positive += score;
    if (task.status === "completed") completed += 1;
  }
  const penalty = Math.max(-10, rawPenalty);
  const earned = positive + penalty;
  return {
    earned,
    planned,
    percent: planned > 0 ? Math.max(0, (earned / planned) * 100) : 0,
    completed,
    total: relevant.length,
    penalty,
  };
}
