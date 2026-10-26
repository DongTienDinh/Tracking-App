import { describe, expect, it } from "vitest";
import { chooseMotivation } from "@/domain/motivation";
import type { MotivationExposure } from "@/domain/types";

function exposure(date: string, kind: MotivationExposure["kind"]): MotivationExposure {
  return { id: `${date}-${kind}`, profileId: "profile-1", date, kind };
}

describe("chooseMotivation", () => {
  it("keeps the selected kind stable for the same day", () => {
    const selected = chooseMotivation("2026-10-26", [], [], [exposure("2026-10-26", "volume")]);
    expect(selected.kind).toBe("volume");
  });

  it("does not repeat one fallback kind for more than two consecutive days", () => {
    const selected = chooseMotivation("2026-10-29", [], [], [
      exposure("2026-10-27", "next-action"),
      exposure("2026-10-28", "next-action"),
    ]);
    expect(selected.kind).toBe("volume");
  });
});
