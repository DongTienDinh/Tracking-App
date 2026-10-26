import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "@/components/ui/progress-bar";

describe("ProgressBar", () => {
  it("exposes an accessible bounded value", () => {
    render(<ProgressBar value={125} label="Tiến độ đồ án" />);
    expect(screen.getByRole("progressbar", { name: "Tiến độ đồ án" })).toHaveAttribute("aria-valuenow", "100");
  });
});
