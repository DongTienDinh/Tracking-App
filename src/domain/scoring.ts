import type { DailyTask, DayMeta } from "@/domain/types";

export interface DailyScore {
  earned: number;
  planned: number;
  percent: number;
  completed: number;
  total: number;
  penalty: number;
}

export function calculateDailyScore(tasks: DailyTask[], day?: DayMeta): DailyScore {
  void day;
  const relevant = tasks.filter((task) => task.status !== "deferred");
  const planned = relevant.length * 100;
  const earned = relevant.reduce((total, task) => total + (task.status === "skipped" ? 0 : task.progress), 0);
  const completed = relevant.filter((task) => task.progress === 100).length;
  return {
    earned,
    planned,
    percent: planned > 0 ? (earned / planned) * 100 : 0,
    completed,
    total: relevant.length,
    penalty: 0,
  };
}
