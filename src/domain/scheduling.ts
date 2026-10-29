import { getDay, isAfter } from "date-fns";
import type { Habit, Weekday } from "@/domain/types";
import { fromDateKey } from "@/lib/dates";

export function isHabitDue(habit: Habit, dateKey: string): boolean {
  if (!habit.isActive || isAfter(fromDateKey(habit.startDate), fromDateKey(dateKey))) return false;
  if (habit.scheduleType === "weekly_target") return true;
  const day = getDay(fromDateKey(dateKey));
  return habit.weekdays?.includes(day) ?? false;
}

export function habitNameForWeekday(habit: Habit, weekday: Weekday): string {
  return habit.dayPlans?.find((plan) => plan.weekday === weekday)?.name || habit.name;
}

export function habitNameForDate(habit: Habit, dateKey: string): string {
  return habitNameForWeekday(habit, getDay(fromDateKey(dateKey)) as Weekday);
}

export function habitPoints(habit: Habit, completion: "standard" | "minimum"): number {
  return completion === "minimum" ? habit.basePoints * 0.5 : habit.basePoints;
}
