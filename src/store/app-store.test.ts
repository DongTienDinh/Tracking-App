import { beforeEach, describe, expect, it } from "vitest";
import { calculateDailyScore } from "@/domain/scoring";
import { useAppStore } from "@/store/app-store";
import { appStorage, task } from "@/test/fixtures/app-data";

describe("app store workflows", () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.getState().replaceStorage(appStorage());
  });

  it("enforces Top 3 per profile and date", () => {
    const store = useAppStore.getState();
    for (let index = 0; index < 4; index += 1) {
      store.addTask({
        title: `Task ${index}`,
        date: "2026-10-25",
        priority: "important",
        isBinary: true,
        isTopPriority: true,
      });
    }

    expect(useAppStore.getState().tasks.filter((item) => item.isTopPriority)).toHaveLength(3);
  });

  it("creates one linked occurrence when deferring and scores only completion", () => {
    const store = useAppStore.getState();
    const originalId = store.addTask({
      title: "Chạy baseline",
      date: "2026-10-25",
      priority: "important",
      isBinary: false,
    });
    const nextId = store.deferTask(originalId, "2026-10-26", "Cần thêm dữ liệu");

    expect(nextId).toBeTruthy();
    expect(useAppStore.getState().deferTask(originalId, "2026-10-27", "Lặp lại")).toBeNull();
    expect(useAppStore.getState().deferrals).toHaveLength(1);

    useAppStore.getState().setTaskProgress(nextId!, 100);
    const state = useAppStore.getState();
    const oldScore = calculateDailyScore(state.tasks.filter((item) => item.date === "2026-10-25"));
    const newScore = calculateDailyScore(state.tasks.filter((item) => item.date === "2026-10-26"));
    expect(oldScore.earned).toBe(0);
    expect(newScore.earned).toBe(20);
  });

  it("does not replace current state when an import is invalid", () => {
    useAppStore.getState().replaceStorage({ ...appStorage(), tasks: [task()] });
    expect(() => useAppStore.getState().importBackup('{"schemaVersion":1}')).toThrow();
    expect(useAppStore.getState().tasks).toHaveLength(1);
  });

  it("updates one task among 1,000 in under 100ms", () => {
    const tasks = Array.from({ length: 1_000 }, (_, index) => task({
      id: `task-${index}`,
      taskChainId: `chain-${index}`,
    }));
    useAppStore.getState().replaceStorage({ ...appStorage(), tasks });

    const startedAt = performance.now();
    useAppStore.getState().setTaskProgress("task-500", 100);
    const duration = performance.now() - startedAt;

    expect(useAppStore.getState().tasks[500].status).toBe("completed");
    expect(duration).toBeLessThan(100);
  });

  it("records only one motivation exposure per profile and date", () => {
    useAppStore.getState().recordMotivationExposure("2026-10-25", "next-action");
    useAppStore.getState().recordMotivationExposure("2026-10-25", "next-action");
    expect(useAppStore.getState().motivationExposures).toHaveLength(1);
  });

  it("limits profiles to three", () => {
    useAppStore.getState().resetAll();
    useAppStore.getState().createProfile("Nghiên cứu");
    useAppStore.getState().createProfile("Cá nhân");
    useAppStore.getState().createProfile("Không được tạo");
    expect(useAppStore.getState().profiles.map((profile) => profile.name)).toEqual([
      "Hồ sơ mới", "Nghiên cứu", "Cá nhân",
    ]);
  });

  it("persists the one-to-three tasks kept at checkpoint", () => {
    const first = useAppStore.getState().addTask({ title: "Baseline", date: "2026-10-25", priority: "important", isBinary: true });
    const second = useAppStore.getState().addTask({ title: "Ablation", date: "2026-10-25", priority: "medium", isBinary: true });
    useAppStore.getState().saveCheckpoint("2026-10-25", "medium", first, "Giữ hai việc", [
      { taskId: first, action: "keep" },
      { taskId: second, action: "keep" },
    ]);
    expect(useAppStore.getState().checkpoints[0].planChanges).toEqual([
      { taskId: first, action: "keep" },
      { taskId: second, action: "keep" },
    ]);
  });
});
