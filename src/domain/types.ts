export type Priority = "normal" | "medium" | "important" | "critical";
export type Progress = number;
export type TaskStatus = "planned" | "in_progress" | "completed" | "deferred" | "skipped";
export type EnergyLevel = "low" | "medium" | "good";
export type HabitCategory = "study" | "fitness" | "personal" | "other";
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type CalendarView = "month" | "week" | "day";
export type ThemeMode = "light" | "dark";
export type ThemeChoice = "default" | "auto" | "spring" | "summer" | "autumn" | "winter" | "tet" | "christmas" | "national-day";
export type ThemePreset = Exclude<ThemeChoice, "auto">;
export type ThemeBackground = "soft" | "vivid" | "custom";
export type ThemeEffectChoice = "auto" | "petals" | "sunlight" | "leaves" | "snow" | "confetti" | "sparkles";
export type ThemeEffectDensity = "low" | "medium" | "high";
export type ThemeEffectSpeed = "slow" | "normal" | "fast";

export interface ThemeCustomization {
  background: ThemeBackground;
  backgroundColor: string;
  accentColor: string;
  effectsEnabled: boolean;
  effectChoice: ThemeEffectChoice;
  effectDensity: ThemeEffectDensity;
  effectSpeed: ThemeEffectSpeed;
  effectColor: string;
}

export type ThemeCustomizations = Record<ThemePreset, ThemeCustomization>;

export interface ProfilePreferences {
  checkpointTime: string;
  calendarView: CalendarView;
  calendarDate: string;
  themeMode: ThemeMode;
  themeChoice: ThemeChoice;
  themeCustomizations: ThemeCustomizations;
}

export interface Profile {
  id: string;
  name: string;
  createdAt: string;
  locale: "vi-VN";
  preferences: ProfilePreferences;
}

export interface DailyTask {
  id: string;
  profileId: string;
  taskChainId: string;
  date: string;
  title: string;
  description?: string;
  priority: Priority;
  category: HabitCategory;
  progress: Progress;
  status: TaskStatus;
  isBinary: boolean;
  isTopPriority: boolean;
  checklist?: TaskChecklistItem[];
  goalId?: string;
  habitId?: string;
  note?: string;
  deferReason?: string;
  skipReason?: string;
  deferredTo?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TaskChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskDeferral {
  id: string;
  profileId: string;
  taskChainId: string;
  fromTaskId: string;
  toTaskId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  profileId: string;
  name: string;
  category: HabitCategory;
  scheduleType: "fixed_days" | "weekly_target";
  weekdays?: number[];
  dayPlans?: { weekday: Weekday; name: string }[];
  weeklyTarget?: number;
  basePoints: number;
  minimumVersion?: { label: string; pointMultiplier: 0.5 };
  goalId?: string;
  startDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  profileId: string;
  habitId: string;
  date: string;
  completion: "standard" | "minimum";
  pointsEarned: number;
  completedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  weight: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Goal {
  id: string;
  profileId: string;
  title: string;
  description?: string;
  why?: string;
  startDate: string;
  targetDate?: string;
  status: "active" | "paused" | "completed" | "archived";
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckpointPlanChange {
  taskId: string;
  action: "keep" | "reduce" | "defer" | "skip";
  note?: string;
}

export interface MiddayCheckpoint {
  id: string;
  profileId: string;
  date: string;
  completedAt: string;
  completionPercent: number;
  energy: EnergyLevel;
  nextTaskId?: string;
  planChanges: CheckpointPlanChange[];
  note?: string;
}

export interface DailyNote {
  id: string;
  profileId: string;
  date: string;
  content: string;
  updatedAt: string;
}

export interface DailyReview {
  id: string;
  profileId: string;
  date: string;
  completedAt: string;
  note?: string;
}

export interface DayMeta {
  profileId: string;
  date: string;
  isRecoveryDay: boolean;
  planConfirmedAt?: string;
  reviewCompletedAt?: string;
}

export interface MotivationExposure {
  id: string;
  profileId: string;
  date: string;
  kind: "weekly-comparison" | "streak" | "goal" | "volume" | "next-action";
}

export interface AppStorage {
  schemaVersion: 4;
  activeProfileId: string;
  profiles: Profile[];
  tasks: DailyTask[];
  deferrals: TaskDeferral[];
  habits: Habit[];
  habitLogs: HabitLog[];
  goals: Goal[];
  checkpoints: MiddayCheckpoint[];
  notes: DailyNote[];
  reviews: DailyReview[];
  days: DayMeta[];
  motivationExposures: MotivationExposure[];
}
