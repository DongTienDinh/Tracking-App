"use client";

import { addDays } from "date-fns";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AppStorage, CalendarView, CheckpointPlanChange, DailyTask, EnergyLevel, Goal, Habit, HabitCategory,
  MotivationExposure, Priority, Profile, Progress,
} from "@/domain/types";
import { calculateDailyScore } from "@/domain/scoring";
import { habitPoints } from "@/domain/scheduling";
import { createDefaultThemeCustomizations } from "@/domain/theme";
import { createId } from "@/lib/ids";
import { fromDateKey, nowIso, toDateKey } from "@/lib/dates";
import { migrateStorage, parseBackup } from "@/store/migrations";
import { browserStorage, STORAGE_KEY } from "@/store/storage-adapter";

type CreateTaskInput = Pick<DailyTask, "title" | "date" | "priority" | "isBinary"> & Partial<Pick<DailyTask, "category" | "description" | "goalId" | "note" | "isTopPriority">> & { checklist?: string[] };
type CreateHabitInput = Pick<Habit, "name" | "category" | "scheduleType" | "basePoints" | "startDate"> & Partial<Pick<Habit, "weekdays" | "dayPlans" | "weeklyTarget" | "minimumVersion" | "goalId">>;
type CreateGoalInput = Pick<Goal, "title" | "startDate"> & Partial<Pick<Goal, "description" | "why" | "targetDate">>;

export interface AppState extends AppStorage {
  hasHydrated: boolean;
  storageError?: string;
  setHydrated: (value: boolean) => void;
  createProfile: (name: string) => void;
  switchProfile: (profileId: string) => void;
  updateProfile: (profileId: string, patch: Partial<Pick<Profile, "name" | "preferences">>) => void;
  deleteProfile: (profileId: string) => void;
  addTask: (input: CreateTaskInput) => string;
  updateTask: (taskId: string, patch: Partial<DailyTask>) => void;
  setTaskProgress: (taskId: string, progress: Progress) => void;
  addTaskChecklistItem: (taskId: string, title: string) => void;
  toggleTaskChecklistItem: (taskId: string, itemId: string) => void;
  deleteTaskChecklistItem: (taskId: string, itemId: string) => void;
  setTopPriority: (taskId: string, value: boolean) => boolean;
  deferTask: (taskId: string, toDate: string, reason: string) => string | null;
  skipTask: (taskId: string, reason: string) => void;
  deleteTask: (taskId: string) => void;
  addHabit: (input: CreateHabitInput) => void;
  updateHabit: (habitId: string, patch: Partial<Habit>) => void;
  deleteHabit: (habitId: string) => void;
  logHabit: (habitId: string, date: string, completion: "standard" | "minimum" | null) => void;
  addGoal: (input: CreateGoalInput) => void;
  updateGoal: (goalId: string, patch: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  addMilestone: (goalId: string, title: string, weight: number) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  saveCheckpoint: (date: string, energy: EnergyLevel, nextTaskId?: string, note?: string, planChanges?: CheckpointPlanChange[]) => void;
  saveNote: (date: string, content: string) => void;
  confirmPlan: (date: string) => void;
  completeReview: (date: string, note?: string) => void;
  setRecoveryDay: (date: string, value: boolean) => void;
  setCalendarPreferences: (view: CalendarView, date: string) => void;
  recordMotivationExposure: (date: string, kind: MotivationExposure["kind"]) => void;
  replaceStorage: (storage: AppStorage) => void;
  exportBackup: () => string;
  importBackup: (json: string) => void;
  resetAll: () => void;
}

function makeInitialStorage(): AppStorage {
  const today = toDateKey(new Date());
  const createdAt = nowIso();
  const profile: Profile = {
    id: "profile-default",
    name: "Hồ sơ mới",
    createdAt,
    locale: "vi-VN",
    preferences: { checkpointTime: "12:00", calendarView: "month", calendarDate: today, themeMode: "light", themeChoice: "auto", themeCustomizations: createDefaultThemeCustomizations() },
  };
  return {
    schemaVersion: 4,
    activeProfileId: profile.id,
    profiles: [profile],
    tasks: [], deferrals: [], habits: [], habitLogs: [], goals: [], checkpoints: [], notes: [], reviews: [], days: [], motivationExposures: [],
  };
}

function updateDay(days: AppStorage["days"], profileId: string, date: string, patch: Partial<AppStorage["days"][number]>) {
  const existing = days.find((day) => day.profileId === profileId && day.date === date);
  if (existing) return days.map((day) => day === existing ? { ...day, ...patch } : day);
  return [...days, { profileId, date, isRecoveryDay: false, ...patch }];
}

function storageSnapshot(state: AppState): AppStorage {
  return {
    schemaVersion: state.schemaVersion,
    activeProfileId: state.activeProfileId,
    profiles: state.profiles,
    tasks: state.tasks,
    deferrals: state.deferrals,
    habits: state.habits,
    habitLogs: state.habitLogs,
    goals: state.goals,
    checkpoints: state.checkpoints,
    notes: state.notes,
    reviews: state.reviews,
    days: state.days,
    motivationExposures: state.motivationExposures,
  };
}

const initial = makeInitialStorage();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,
      hasHydrated: false,
      setHydrated: (value) => set({ hasHydrated: value }),
      createProfile: (name) => set((state) => {
        if (state.profiles.length >= 3) return state;
        const profile: Profile = {
          id: createId("profile"), name: name.trim(), createdAt: nowIso(), locale: "vi-VN",
          preferences: { checkpointTime: "12:00", calendarView: "month", calendarDate: toDateKey(new Date()), themeMode: "light", themeChoice: "auto", themeCustomizations: createDefaultThemeCustomizations() },
        };
        return { profiles: [...state.profiles, profile], activeProfileId: profile.id };
      }),
      switchProfile: (profileId) => set((state) => state.profiles.some((profile) => profile.id === profileId) ? { activeProfileId: profileId } : state),
      updateProfile: (profileId, patch) => set((state) => ({ profiles: state.profiles.map((profile) => profile.id === profileId ? { ...profile, ...patch } : profile) })),
      deleteProfile: (profileId) => set((state) => {
        if (state.profiles.length === 1) return state;
        const profiles = state.profiles.filter((profile) => profile.id !== profileId);
        return {
          profiles,
          activeProfileId: state.activeProfileId === profileId ? profiles[0].id : state.activeProfileId,
          tasks: state.tasks.filter((item) => item.profileId !== profileId),
          deferrals: state.deferrals.filter((item) => item.profileId !== profileId),
          habits: state.habits.filter((item) => item.profileId !== profileId),
          habitLogs: state.habitLogs.filter((item) => item.profileId !== profileId),
          goals: state.goals.filter((item) => item.profileId !== profileId),
          checkpoints: state.checkpoints.filter((item) => item.profileId !== profileId),
          notes: state.notes.filter((item) => item.profileId !== profileId),
          reviews: state.reviews.filter((item) => item.profileId !== profileId),
          days: state.days.filter((item) => item.profileId !== profileId),
          motivationExposures: state.motivationExposures.filter((item) => item.profileId !== profileId),
        };
      }),
      addTask: (input) => {
        const id = createId("task");
        set((state) => {
          const stamp = nowIso();
          const topCount = state.tasks.filter((task) => task.profileId === state.activeProfileId && task.date === input.date && task.isTopPriority && task.status !== "deferred").length;
          const task: DailyTask = {
            id, profileId: state.activeProfileId, taskChainId: id, title: input.title.trim(), date: input.date,
            priority: input.priority, category: input.category ?? "study", progress: 0, status: "planned", isBinary: input.isBinary,
            isTopPriority: Boolean(input.isTopPriority && topCount < 3), description: input.description,
            checklist: input.checklist?.filter((title) => title.trim()).map((title) => ({ id: createId("check"), title: title.trim(), isCompleted: false })),
            goalId: input.goalId, note: input.note, createdAt: stamp, updatedAt: stamp,
          };
          return { tasks: [...state.tasks, task] };
        });
        return id;
      },
      updateTask: (taskId, patch) => set((state) => ({ tasks: state.tasks.map((task) => task.id === taskId ? { ...task, ...patch, updatedAt: nowIso() } : task) })),
      setTaskProgress: (taskId, progress) => set((state) => ({
        tasks: state.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const safeProgress = Math.max(0, Math.min(100, progress));
          const checklist = task.checklist?.length
            ? task.checklist.map((item) => ({ ...item, isCompleted: safeProgress === 100 }))
            : task.checklist;
          return {
            ...task,
            checklist,
            progress: checklist?.length ? (safeProgress === 100 ? 100 : 0) : safeProgress,
            status: safeProgress === 100 ? "completed" : safeProgress === 0 ? "planned" : "in_progress",
            completedAt: safeProgress === 100 ? nowIso() : undefined,
            updatedAt: nowIso(),
          };
        }),
      })),
      addTaskChecklistItem: (taskId, title) => set((state) => ({
        tasks: state.tasks.map((task) => task.id === taskId && title.trim() ? {
          ...task,
          checklist: [...(task.checklist ?? []), { id: createId("check"), title: title.trim(), isCompleted: false }],
          progress: task.checklist?.length ? task.progress : 0,
          status: task.checklist?.length ? task.status : "planned",
          completedAt: task.checklist?.length ? task.completedAt : undefined,
          updatedAt: nowIso(),
        } : task),
      })),
      toggleTaskChecklistItem: (taskId, itemId) => set((state) => ({
        tasks: state.tasks.map((task) => {
          if (task.id !== taskId || !task.checklist?.length) return task;
          const checklist = task.checklist.map((item) => item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item);
          const progress = (checklist.filter((item) => item.isCompleted).length / checklist.length) * 100;
          return { ...task, checklist, progress, status: progress === 100 ? "completed" : progress === 0 ? "planned" : "in_progress", completedAt: progress === 100 ? nowIso() : undefined, updatedAt: nowIso() };
        }),
      })),
      deleteTaskChecklistItem: (taskId, itemId) => set((state) => ({
        tasks: state.tasks.map((task) => {
          if (task.id !== taskId || !task.checklist) return task;
          const checklist = task.checklist.filter((item) => item.id !== itemId);
          const progress = checklist.length ? (checklist.filter((item) => item.isCompleted).length / checklist.length) * 100 : 0;
          return { ...task, checklist, progress, status: progress === 100 ? "completed" : progress === 0 ? "planned" : "in_progress", completedAt: progress === 100 ? nowIso() : undefined, updatedAt: nowIso() };
        }),
      })),
      setTopPriority: (taskId, value) => {
        const task = get().tasks.find((item) => item.id === taskId);
        if (!task) return false;
        const count = get().tasks.filter((item) => item.profileId === task.profileId && item.date === task.date && item.isTopPriority && item.id !== taskId && item.status !== "deferred").length;
        if (value && count >= 3) return false;
        set((state) => ({ tasks: state.tasks.map((item) => item.id === taskId ? { ...item, isTopPriority: value, updatedAt: nowIso() } : item) }));
        return true;
      },
      deferTask: (taskId, toDate, reason) => {
        const current = get().tasks.find((task) => task.id === taskId);
        if (!current || current.status === "deferred") return null;
        const newId = createId("task");
        const stamp = nowIso();
        const next: DailyTask = {
          ...current, id: newId, date: toDate, progress: 0, status: "planned", isTopPriority: false,
          checklist: current.checklist?.map((item) => ({ ...item, id: createId("check"), isCompleted: false })),
          deferReason: undefined, deferredTo: undefined, createdAt: stamp, updatedAt: stamp, completedAt: undefined,
        };
        set((state) => ({
          tasks: [...state.tasks.map((task) => task.id === taskId ? { ...task, status: "deferred" as const, progress: 0 as const, deferReason: reason, deferredTo: toDate, isTopPriority: false, updatedAt: stamp } : task), next],
          deferrals: [...state.deferrals, { id: createId("deferral"), profileId: current.profileId, taskChainId: current.taskChainId, fromTaskId: current.id, toTaskId: newId, fromDate: current.date, toDate, reason, createdAt: stamp }],
        }));
        return newId;
      },
      skipTask: (taskId, reason) => set((state) => ({ tasks: state.tasks.map((task) => task.id === taskId ? { ...task, status: "skipped", progress: 0, skipReason: reason, isTopPriority: false, updatedAt: nowIso() } : task) })),
      deleteTask: (taskId) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== taskId) })),
      addHabit: (input) => set((state) => ({ habits: [...state.habits, { id: createId("habit"), profileId: state.activeProfileId, name: input.name.trim(), category: input.category, scheduleType: input.scheduleType, weekdays: input.weekdays, dayPlans: input.dayPlans, weeklyTarget: input.weeklyTarget, basePoints: input.basePoints, minimumVersion: input.minimumVersion, goalId: input.goalId, startDate: input.startDate, isActive: true, createdAt: nowIso() }] })),
      updateHabit: (habitId, patch) => set((state) => ({ habits: state.habits.map((habit) => habit.id === habitId ? { ...habit, ...patch } : habit) })),
      deleteHabit: (habitId) => set((state) => ({ habits: state.habits.filter((habit) => habit.id !== habitId), habitLogs: state.habitLogs.filter((log) => log.habitId !== habitId) })),
      logHabit: (habitId, date, completion) => set((state) => {
        const without = state.habitLogs.filter((log) => !(log.habitId === habitId && log.date === date));
        if (!completion) return { habitLogs: without };
        const habit = state.habits.find((item) => item.id === habitId);
        if (!habit) return state;
        return { habitLogs: [...without, { id: createId("habitlog"), profileId: habit.profileId, habitId, date, completion, pointsEarned: habitPoints(habit, completion), completedAt: nowIso() }] };
      }),
      addGoal: (input) => set((state) => ({ goals: [...state.goals, { id: createId("goal"), profileId: state.activeProfileId, title: input.title.trim(), description: input.description, why: input.why, startDate: input.startDate, targetDate: input.targetDate, status: "active", milestones: [], createdAt: nowIso(), updatedAt: nowIso() }] })),
      updateGoal: (goalId, patch) => set((state) => ({ goals: state.goals.map((goal) => goal.id === goalId ? { ...goal, ...patch, updatedAt: nowIso() } : goal) })),
      deleteGoal: (goalId) => set((state) => ({ goals: state.goals.filter((goal) => goal.id !== goalId), tasks: state.tasks.map((task) => task.goalId === goalId ? { ...task, goalId: undefined } : task), habits: state.habits.map((habit) => habit.goalId === goalId ? { ...habit, goalId: undefined } : habit) })),
      addMilestone: (goalId, title, weight) => set((state) => ({ goals: state.goals.map((goal) => goal.id === goalId ? { ...goal, milestones: [...goal.milestones, { id: createId("milestone"), title: title.trim(), weight: weight || 1, isCompleted: false }], updatedAt: nowIso() } : goal) })),
      toggleMilestone: (goalId, milestoneId) => set((state) => ({ goals: state.goals.map((goal) => goal.id === goalId ? { ...goal, milestones: goal.milestones.map((milestone) => milestone.id === milestoneId ? { ...milestone, isCompleted: !milestone.isCompleted, completedAt: !milestone.isCompleted ? nowIso() : undefined } : milestone), updatedAt: nowIso() } : goal) })),
      saveCheckpoint: (date, energy, nextTaskId, note, planChanges = []) => set((state) => {
        const tasks = state.tasks.filter((task) => task.profileId === state.activeProfileId && task.date === date);
        const day = state.days.find((item) => item.profileId === state.activeProfileId && item.date === date);
        const score = calculateDailyScore(tasks, day);
        const checkpoint = { id: createId("checkpoint"), profileId: state.activeProfileId, date, completedAt: nowIso(), completionPercent: score.percent, energy, nextTaskId, planChanges, note };
        return { checkpoints: [...state.checkpoints.filter((item) => !(item.profileId === state.activeProfileId && item.date === date)), checkpoint] };
      }),
      saveNote: (date, content) => set((state) => {
        const existing = state.notes.find((note) => note.profileId === state.activeProfileId && note.date === date);
        const note = { id: existing?.id ?? createId("note"), profileId: state.activeProfileId, date, content, updatedAt: nowIso() };
        return { notes: [...state.notes.filter((item) => item !== existing), note] };
      }),
      confirmPlan: (date) => set((state) => ({ days: updateDay(state.days, state.activeProfileId, date, { planConfirmedAt: nowIso() }) })),
      completeReview: (date, note) => set((state) => {
        const stamp = nowIso();
        const review = { id: createId("review"), profileId: state.activeProfileId, date, completedAt: stamp, note };
        return { reviews: [...state.reviews.filter((item) => !(item.profileId === state.activeProfileId && item.date === date)), review], days: updateDay(state.days, state.activeProfileId, date, { reviewCompletedAt: stamp }) };
      }),
      setRecoveryDay: (date, value) => set((state) => ({ days: updateDay(state.days, state.activeProfileId, date, { isRecoveryDay: value }) })),
      setCalendarPreferences: (view, date) => set((state) => ({ profiles: state.profiles.map((profile) => profile.id === state.activeProfileId ? { ...profile, preferences: { ...profile.preferences, calendarView: view, calendarDate: date } } : profile) })),
      recordMotivationExposure: (date, kind) => set((state) => {
        const existing = state.motivationExposures.find((item) => item.profileId === state.activeProfileId && item.date === date);
        if (existing?.kind === kind) return state;
        const exposure: MotivationExposure = { id: existing?.id ?? createId("motivation"), profileId: state.activeProfileId, date, kind };
        return { motivationExposures: [...state.motivationExposures.filter((item) => item !== existing), exposure] };
      }),
      replaceStorage: (storage) => set({ ...storage, hasHydrated: true, storageError: undefined }),
      exportBackup: () => {
        return JSON.stringify(storageSnapshot(get()), null, 2);
      },
      importBackup: (json) => get().replaceStorage(parseBackup(json)),
      resetAll: () => set({ ...makeInitialStorage(), hasHydrated: true, storageError: undefined }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => browserStorage),
      version: 4,
      migrate: (persistedState) => migrateStorage(persistedState),
      skipHydration: true,
      partialize: (state) => storageSnapshot(state) as unknown as AppState,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          useAppStore.setState({ storageError: "Không thể đọc dữ liệu cục bộ.", hasHydrated: true });
        } else {
          state?.setHydrated(true);
        }
      },
    },
  ),
);

export const DEFAULT_SKIP_REASONS = ["Thiếu thời gian", "Kế hoạch quá nhiều", "Không còn cần thiết", "Sức khỏe", "Khác"] as const;
export const DEFAULT_DEFER_REASON = "Điều chỉnh kế hoạch";
export const HABIT_CATEGORIES: Record<HabitCategory, string> = { study: "Học tập", fitness: "Tập luyện", personal: "Cá nhân", other: "Khác" };
export const PRIORITY_LABELS: Record<Priority, string> = { normal: "Thường", medium: "Trung bình", important: "Quan trọng", critical: "Cực kỳ quan trọng" };

export function tomorrowKey(date: string): string {
  return toDateKey(addDays(fromDateKey(date), 1));
}
