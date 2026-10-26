import { eachDayOfInterval, subDays } from "date-fns";
import type { DailyTask, DayMeta, HabitLog } from "@/domain/types";
import { calculateDailyScore } from "@/domain/scoring";
import { toDateKey } from "@/lib/dates";

export interface DailyInsight {
  date: string;
  earned: number;
  planned: number;
  percent: number;
  completed: number;
  total: number;
  activity: number;
}

export function buildDailyInsights(
  tasks: DailyTask[],
  habitLogs: HabitLog[],
  days: DayMeta[],
  endDate: Date,
  count: number,
): DailyInsight[] {
  const startDate = subDays(endDate, count - 1);
  const tasksByDate = new Map<string, DailyTask[]>();
  const habitCountByDate = new Map<string, number>();
  const dayByDate = new Map(days.map((day) => [day.date, day]));

  for (const task of tasks) {
    const bucket = tasksByDate.get(task.date);
    if (bucket) bucket.push(task);
    else tasksByDate.set(task.date, [task]);
  }
  for (const log of habitLogs) {
    habitCountByDate.set(log.date, (habitCountByDate.get(log.date) ?? 0) + 1);
  }

  return eachDayOfInterval({ start: startDate, end: endDate }).map((date) => {
    const key = toDateKey(date);
    const score = calculateDailyScore(tasksByDate.get(key) ?? [], dayByDate.get(key));
    const habitCount = habitCountByDate.get(key) ?? 0;
    return { date: key, ...score, activity: score.completed + habitCount };
  });
}

export function taskOutcomeCounts(tasks: DailyTask[]) {
  return tasks.reduce(
    (counts, task) => {
      if (task.status === "completed") counts.completed += 1;
      if (task.status === "deferred") counts.deferred += 1;
      if (task.status === "skipped") counts.skipped += 1;
      return counts;
    },
    { completed: 0, deferred: 0, skipped: 0 },
  );
}
