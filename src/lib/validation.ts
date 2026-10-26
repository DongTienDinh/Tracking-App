import { z } from "zod";

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const isoDate = z.string().datetime();
const id = z.string().min(1);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const themeCustomizationSchema = z.object({
  background: z.enum(["soft", "vivid", "custom"]),
  backgroundColor: hexColor,
  accentColor: hexColor,
  effectsEnabled: z.boolean(),
  effectChoice: z.enum(["auto", "petals", "sunlight", "leaves", "snow", "confetti", "sparkles"]),
  effectDensity: z.enum(["low", "medium", "high"]),
  effectSpeed: z.enum(["slow", "normal", "fast"]),
  effectColor: hexColor,
});

const profileSchema = z.object({
  id,
  name: z.string().trim().min(1).max(60),
  createdAt: isoDate,
  locale: z.literal("vi-VN"),
  preferences: z.object({
    checkpointTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    calendarView: z.enum(["month", "week", "day"]),
    calendarDate: dateKey,
    themeMode: z.enum(["light", "dark"]),
    themeChoice: z.enum(["default", "auto", "spring", "summer", "autumn", "winter", "tet", "christmas", "national-day"]),
    themeCustomizations: z.object({
      default: themeCustomizationSchema,
      spring: themeCustomizationSchema,
      summer: themeCustomizationSchema,
      autumn: themeCustomizationSchema,
      winter: themeCustomizationSchema,
      tet: themeCustomizationSchema,
      christmas: themeCustomizationSchema,
      "national-day": themeCustomizationSchema,
    }),
  }),
});

const taskSchema = z.object({
  id, profileId: id, taskChainId: id, date: dateKey,
  title: z.string().trim().min(1).max(160),
  description: z.string().max(1000).optional(),
  priority: z.enum(["normal", "medium", "important", "critical"]),
  category: z.enum(["study", "fitness", "personal", "other"]),
  progress: z.union([z.literal(0), z.literal(25), z.literal(50), z.literal(75), z.literal(100)]),
  status: z.enum(["planned", "in_progress", "completed", "deferred", "skipped"]),
  isBinary: z.boolean(), isTopPriority: z.boolean(),
  goalId: id.optional(), habitId: id.optional(), note: z.string().max(2000).optional(),
  deferReason: z.string().max(200).optional(), skipReason: z.string().max(200).optional(),
  deferredTo: dateKey.optional(), createdAt: isoDate, updatedAt: isoDate, completedAt: isoDate.optional(),
});

const deferralSchema = z.object({
  id, profileId: id, taskChainId: id, fromTaskId: id, toTaskId: id,
  fromDate: dateKey, toDate: dateKey, reason: z.string().min(1).max(200), createdAt: isoDate,
});

const habitSchema = z.object({
  id, profileId: id, name: z.string().trim().min(1).max(120),
  category: z.enum(["study", "fitness", "personal", "other"]),
  scheduleType: z.enum(["fixed_days", "weekly_target"]),
  weekdays: z.array(z.number().int().min(0).max(6)).optional(),
  weeklyTarget: z.number().int().min(1).max(7).optional(),
  basePoints: z.number().min(0).max(100),
  minimumVersion: z.object({ label: z.string().min(1).max(120), pointMultiplier: z.literal(0.5) }).optional(),
  goalId: id.optional(), startDate: dateKey, isActive: z.boolean(), createdAt: isoDate,
});

const habitLogSchema = z.object({
  id, profileId: id, habitId: id, date: dateKey,
  completion: z.enum(["standard", "minimum"]), pointsEarned: z.number(), completedAt: isoDate,
});

const milestoneSchema = z.object({
  id, title: z.string().trim().min(1).max(160), weight: z.number().min(0),
  isCompleted: z.boolean(), completedAt: isoDate.optional(),
});

const goalSchema = z.object({
  id, profileId: id, title: z.string().trim().min(1).max(160),
  description: z.string().max(1000).optional(), why: z.string().max(1000).optional(),
  startDate: dateKey, targetDate: dateKey.optional(),
  status: z.enum(["active", "paused", "completed", "archived"]),
  milestones: z.array(milestoneSchema), createdAt: isoDate, updatedAt: isoDate,
});

const checkpointSchema = z.object({
  id, profileId: id, date: dateKey, completedAt: isoDate,
  completionPercent: z.number().min(0).max(100), energy: z.enum(["low", "medium", "good"]),
  nextTaskId: id.optional(),
  planChanges: z.array(z.object({ taskId: id, action: z.enum(["keep", "reduce", "defer", "skip"]), note: z.string().max(300).optional() })),
  note: z.string().max(1000).optional(),
});

const noteSchema = z.object({ id, profileId: id, date: dateKey, content: z.string().max(10000), updatedAt: isoDate });
const reviewSchema = z.object({ id, profileId: id, date: dateKey, completedAt: isoDate, note: z.string().max(2000).optional() });
const daySchema = z.object({ profileId: id, date: dateKey, isRecoveryDay: z.boolean(), planConfirmedAt: isoDate.optional(), reviewCompletedAt: isoDate.optional() });
const exposureSchema = z.object({ id, profileId: id, date: dateKey, kind: z.enum(["weekly-comparison", "streak", "goal", "volume", "next-action"]) });

export const appStorageSchema = z.object({
  schemaVersion: z.literal(4),
  activeProfileId: id,
  profiles: z.array(profileSchema).min(1).max(3),
  tasks: z.array(taskSchema),
  deferrals: z.array(deferralSchema),
  habits: z.array(habitSchema),
  habitLogs: z.array(habitLogSchema),
  goals: z.array(goalSchema),
  checkpoints: z.array(checkpointSchema),
  notes: z.array(noteSchema),
  reviews: z.array(reviewSchema),
  days: z.array(daySchema),
  motivationExposures: z.array(exposureSchema),
}).superRefine((value, context) => {
  if (!value.profiles.some((profile) => profile.id === value.activeProfileId)) {
    context.addIssue({ code: "custom", path: ["activeProfileId"], message: "Hồ sơ đang hoạt động không tồn tại." });
  }
});
