import { describe, expect, it } from "vitest";
import { monthGridDates } from "@/domain/calendar";

describe("monthGridDates", () => {
  it.each([
    [2023, 1, 28],
    [2024, 1, 29],
    [2026, 3, 30],
    [2026, 0, 31],
  ])("covers a month with %i/%i and %i in-month days", (year, month, expectedDays) => {
    const dates = monthGridDates(new Date(year, month, 15));
    expect(dates.filter((date) => date.getMonth() === month)).toHaveLength(expectedDays);
    expect(dates[0].getDay()).toBe(1);
    expect(dates.at(-1)?.getDay()).toBe(0);
    expect([35, 42]).toContain(dates.length);
  });
});
