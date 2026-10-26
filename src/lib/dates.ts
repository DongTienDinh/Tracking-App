import { format, parseISO, startOfWeek } from "date-fns";

export const DATE_FORMAT = "yyyy-MM-dd";

export function toDateKey(date: Date): string {
  return format(date, DATE_FORMAT);
}

export function fromDateKey(value: string): Date {
  return parseISO(`${value}T12:00:00`);
}

export function weekKey(date: Date): string {
  return toDateKey(startOfWeek(date, { weekStartsOn: 1 }));
}

export function nowIso(): string {
  return new Date().toISOString();
}
