import type { DailyTask } from "@/domain/types";

export type CheckpointAttention = "no-tasks" | "upcoming" | "due-empty" | "due-progress" | "recorded";

export interface CheckpointSummary {
  attention: CheckpointAttention;
  completed: number;
  total: number;
  isDue: boolean;
  message: string;
}

export function isCheckpointDue(now: Date, checkpointTime: string): boolean {
  const [hoursText = "0", minutesText = "0"] = checkpointTime.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  return now.getHours() * 60 + now.getMinutes() >= hours * 60 + minutes;
}

export function buildCheckpointSummary(
  tasks: DailyTask[],
  now: Date,
  checkpointTime: string,
  hasCheckpoint: boolean,
): CheckpointSummary {
  const actionableTasks = tasks.filter((task) => !["deferred", "skipped"].includes(task.status));
  const completed = actionableTasks.filter((task) => task.progress === 100).length;
  const total = actionableTasks.length;
  const isDue = isCheckpointDue(now, checkpointTime);

  if (total === 0) {
    return {
      attention: "no-tasks",
      completed,
      total,
      isDue,
      message: "Chưa có công việc để checkpoint. Hãy thiết lập ngày trước.",
    };
  }

  if (hasCheckpoint && completed > 0) {
    return {
      attention: "recorded",
      completed,
      total,
      isDue,
      message: `Đã ghi nhận ${completed}/${total} việc hoàn thành.`,
    };
  }

  if (isDue && completed === 0) {
    return {
      attention: "due-empty",
      completed,
      total,
      isDue,
      message: "Chưa có việc nào hoàn thành. Đừng bỏ cuộc — hãy chọn một việc nhỏ và cố gắng hết sức trong chặng tiếp theo.",
    };
  }

  if (isDue) {
    return {
      attention: "due-progress",
      completed,
      total,
      isDue,
      message: `Bạn đã hoàn thành ${completed}/${total} việc. Hãy xác nhận checkpoint để chốt tiến độ.`,
    };
  }

  return {
    attention: "upcoming",
    completed,
    total,
    isDue,
    message: completed > 0
      ? `Bạn đã tick ${completed}/${total} việc. Checkpoint bắt buộc lúc ${checkpointTime}.`
      : `Tick việc đã hoàn thành trước checkpoint bắt buộc lúc ${checkpointTime}.`,
  };
}
