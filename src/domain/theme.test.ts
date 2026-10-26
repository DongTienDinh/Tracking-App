import { describe, expect, it } from "vitest";
import { effectForTheme, resolveAutomaticTheme, resolveTheme } from "@/domain/theme";

describe("appearance themes", () => {
  it("keeps an explicitly selected theme", () => {
    expect(resolveTheme("autumn", new Date(2026, 3, 10))).toBe("autumn");
    expect(effectForTheme("autumn")).toBe("leaves");
  });

  it("lets default disable the seasonal layer", () => {
    expect(resolveTheme("default", new Date(2026, 11, 24))).toBe("default");
    expect(effectForTheme("default")).toBe("none");
  });

  it("prioritises supported holidays over the season", () => {
    expect(resolveAutomaticTheme(new Date(2026, 11, 24))).toBe("christmas");
    expect(resolveAutomaticTheme(new Date(2026, 8, 2))).toBe("national-day");
  });

  it("uses the season outside supported holidays", () => {
    expect(resolveAutomaticTheme(new Date(2026, 3, 10))).toBe("spring");
    expect(resolveAutomaticTheme(new Date(2026, 6, 10))).toBe("summer");
    expect(resolveAutomaticTheme(new Date(2026, 9, 10))).toBe("autumn");
    expect(resolveAutomaticTheme(new Date(2026, 0, 10))).toBe("winter");
  });
});
