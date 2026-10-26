import { addDays, addWeeks, endOfWeek, isWithinInterval, startOfWeek, subDays, subWeeks } from "date-fns";
import type { DailyTask, DayMeta, Habit, HabitLog } from "@/domain/types";
import { fromDateKey, toDateKey } from "@/lib/dates";

function hasLog(logs: HabitLog[], habitId: string, date: string): boolean {
  return logs.some((log) => log.habitId === habitId && log.date === date);
}

export function activityStreak(
  tasks: DailyTask[],
  logs: HabitLog[],
  days: DayMeta[],
  referenceDate: string,
): number {
  const activeDates = new Set([
    ...tasks.filter((task) => task.progress === 100).map((task) => task.date),
    ...logs.map((log) => log.date),
  ]);
  const recoveryDates = new Set(days.filter((day) => day.isRecoveryDay).map((day) => day.date));
  let cursor = fromDateKey(referenceDate);
  let streak = 0;

  for (let index = 0; index < 3660; index += 1) {
    const date = toDateKey(cursor);
    if (activeDates.has(date)) {
      streak += 1;
    } else if (!recoveryDates.has(date)) {
      if (index === 0) {
        cursor = subDays(cursor, 1);
        continue;
      }
      break;
    }
    cursor = subDays(cursor, 1);
  }

  return streak;
}

export function habitStreak(habit: Habit, logs: HabitLog[], days: DayMeta[], referenceDate: string): number {
  if (habit.scheduleType === "weekly_target") {
    let streak = 0;
    let cursor = startOfWeek(fromDateKey(referenceDate), { weekStartsOn: 1 });
    for (let index = 0; index < 520; index += 1) {
      const end = endOfWeek(cursor, { weekStartsOn: 1 });
      const count = logs.filter((log) => log.habitId === habit.id && isWithinInterval(fromDateKey(log.date), { start: cursor, end })).length;
      const recovery = days.some((day) => day.isRecoveryDay && isWithinInterval(fromDateKey(day.date), { start: cursor, end }));
      if (count >= (habit.weeklyTarget ?? 1)) streak += 1;
      else if (!recovery) break;
      cursor = subWeeks(cursor, 1);
    }
    return streak;
  }

  let streak = 0;
  let cursor = fromDateKey(referenceDate);
  const scheduled = new Set(habit.weekdays ?? []);
  for (let index = 0; index < 3660; index += 1) {
    while (!scheduled.has(cursor.getDay())) cursor = subDays(cursor, 1);
    const date = toDateKey(cursor);
    const recovery = days.some((day) => day.date === date && day.isRecoveryDay);
    if (hasLog(logs, habit.id, date)) streak += 1;
    else if (!recovery) break;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export function scheduledDatesBetween(habit: Habit, start: string, end: string): string[] {
  const dates: string[] = [];
  let cursor = fromDateKey(start);
  const endDate = fromDateKey(end);
  while (cursor <= endDate) {
    if (habit.scheduleType === "fixed_days" && habit.weekdays?.includes(cursor.getDay())) dates.push(toDateKey(cursor));
    cursor = addDays(cursor, 1);
  }
  return dates;
}

export function previousWeekStart(date: Date): Date {
  return addWeeks(startOfWeek(date, { weekStartsOn: 1 }), -1);
}
