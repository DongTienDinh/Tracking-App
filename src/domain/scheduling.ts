import { getDay, isAfter } from "date-fns";
import type { Habit } from "@/domain/types";
import { fromDateKey } from "@/lib/dates";

export function isHabitDue(habit: Habit, dateKey: string): boolean {
  if (!habit.isActive || isAfter(fromDateKey(habit.startDate), fromDateKey(dateKey))) return false;
  if (habit.scheduleType === "weekly_target") return true;
  const day = getDay(fromDateKey(dateKey));
  return habit.weekdays?.includes(day) ?? false;
}

export function habitPoints(habit: Habit, completion: "standard" | "minimum"): number {
  return completion === "minimum" ? habit.basePoints * 0.5 : habit.basePoints;
}
