import type { AppStorage, DailyTask } from "@/domain/types";
import { createDefaultThemeCustomizations } from "@/domain/theme";

export const stamp = "2026-10-25T08:00:00.000Z";

export function task(overrides: Partial<DailyTask> = {}): DailyTask {
  return {
    id: "task-1", profileId: "profile-1", taskChainId: "chain-1", date: "2026-10-25",
    title: "Thử nghiệm mô hình SOTA", priority: "important", category: "study", progress: 0,
    status: "planned", isBinary: false, isTopPriority: true, createdAt: stamp, updatedAt: stamp,
    ...overrides,
  };
}

export function appStorage(): AppStorage {
  return {
    schemaVersion: 4,
    activeProfileId: "profile-1",
    profiles: [{ id: "profile-1", name: "Sinh viên AI", createdAt: stamp, locale: "vi-VN", preferences: { checkpointTime: "12:00", calendarView: "month", calendarDate: "2026-10-25", themeMode: "light", themeChoice: "auto", themeCustomizations: createDefaultThemeCustomizations() } }],
    tasks: [], deferrals: [], habits: [], habitLogs: [], goals: [], checkpoints: [], notes: [], reviews: [], days: [], motivationExposures: [],
  };
}
