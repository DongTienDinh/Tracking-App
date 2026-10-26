import { subDays } from "date-fns";
import type { DailyTask, Goal, MotivationExposure } from "@/domain/types";
import { goalProgress } from "@/domain/goals";
import { buildDailyInsights } from "@/domain/insights";
import { fromDateKey, toDateKey } from "@/lib/dates";

export interface MotivationMessage {
  kind: MotivationExposure["kind"];
  text: string;
}

export function chooseMotivation(
  date: string,
  tasks: DailyTask[],
  goals: Goal[],
  exposures: MotivationExposure[],
): MotivationMessage {
  const currentExposure = exposures.find((item) => item.date === date);
  const recentKinds = exposures
    .filter((item) => item.date < date && item.date >= toDateKey(subDays(fromDateKey(date), 2)))
    .map((item) => item.kind);
  const currentWeek = buildDailyInsights(tasks, [], [], fromDateKey(date), 7);
  const previousWeek = buildDailyInsights(tasks, [], [], subDays(fromDateKey(date), 7), 7);
  const currentCompleted = currentWeek.reduce((sum, day) => sum + day.completed, 0);
  const previousCompleted = previousWeek.reduce((sum, day) => sum + day.completed, 0);
  const candidates: MotivationMessage[] = [];
  if (currentCompleted + previousCompleted > 0) {
    const difference = currentCompleted - previousCompleted;
    candidates.push({
      kind: "weekly-comparison",
      text: difference >= 0
        ? `7 ngày qua bạn hoàn thành ${currentCompleted} việc, nhiều hơn giai đoạn trước ${difference} việc.`
        : `7 ngày qua bạn hoàn thành ${currentCompleted} việc. Hãy giữ kế hoạch hôm nay vừa sức.`,
    });
  }
  const nearest = goals
    .filter((goal) => goal.status === "active")
    .map((goal) => ({ goal, progress: goalProgress(goal) }))
    .sort((a, b) => b.progress - a.progress)[0];
  if (nearest) {
    candidates.push({ kind: "goal", text: `${nearest.goal.title} đã đạt ${Math.round(nearest.progress)}%. Một cột mốc nhỏ hôm nay sẽ giữ nhịp.` });
  }
  const todayTasks = tasks.filter((task) => task.date === date && task.status !== "completed" && task.status !== "deferred");
  const next = todayTasks.find((task) => task.isTopPriority) ?? todayTasks[0];
  candidates.push(next
    ? { kind: "next-action", text: `Việc nên làm tiếp theo: ${next.title}.` }
    : { kind: "next-action", text: "Bắt đầu bằng một việc nhỏ 5–10 điểm để tạo đà cho hôm nay." });
  candidates.push(todayTasks.length
    ? { kind: "volume", text: `Hôm nay còn ${todayTasks.length} việc đang mở. Hoàn thành một việc trước khi thêm việc mới.` }
    : { kind: "volume", text: "Hôm nay chưa có việc cần xử lý. Hãy lên một kế hoạch nhỏ và thực tế." });

  if (currentExposure) return candidates.find((item) => item.kind === currentExposure.kind) ?? candidates[0];
  return candidates.find((item) => !recentKinds.includes(item.kind)) ?? candidates[0];
}
