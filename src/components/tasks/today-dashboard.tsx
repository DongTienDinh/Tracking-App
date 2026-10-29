"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { differenceInCalendarDays, format } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckCircle2, Flame, SlidersHorizontal } from "lucide-react";
import { QuickCheckpointCard } from "@/components/checkpoint/quick-checkpoint-card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TaskRow } from "@/components/tasks/task-row";
import { TodayPerformance } from "@/components/insights/today-performance";
import { ActivityHeatmap } from "@/components/insights/activity-heatmap";
import { calculateDailyScore } from "@/domain/scoring";
import { buildDailyInsights } from "@/domain/insights";
import { chooseMotivation } from "@/domain/motivation";
import { goalProgress } from "@/domain/goals";
import { habitNameForDate, isHabitDue } from "@/domain/scheduling";
import { activityStreak } from "@/domain/streaks";
import { fromDateKey, toDateKey } from "@/lib/dates";
import { formatPercent } from "@/lib/numbers";
import { useAppStore } from "@/store/app-store";

export function TodayDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const savedDateParam = searchParams.get("planSaved");
  const savedDate = savedDateParam && /^\d{4}-\d{2}-\d{2}$/.test(savedDateParam) ? savedDateParam : null;
  const [dismissedSavedDate, setDismissedSavedDate] = useState<string | null>(null);
  const showPlanSaved = Boolean(savedDate && savedDate !== dismissedSavedDate);
  const today = toDateKey(new Date());
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const profiles = useAppStore((state) => state.profiles);
  const allTasks = useAppStore((state) => state.tasks);
  const allHabits = useAppStore((state) => state.habits);
  const habitLogs = useAppStore((state) => state.habitLogs);
  const allGoals = useAppStore((state) => state.goals);
  const checkpoints = useAppStore((state) => state.checkpoints);
  const days = useAppStore((state) => state.days);
  const exposures = useAppStore((state) => state.motivationExposures);
  const logHabit = useAppStore((state) => state.logHabit);
  const recordMotivationExposure = useAppStore((state) => state.recordMotivationExposure);

  const profile = profiles.find((item) => item.id === activeProfileId)!;
  const tasks = useMemo(() => allTasks.filter((task) => task.profileId === activeProfileId && task.date === today), [allTasks, activeProfileId, today]);
  const goals = useMemo(() => allGoals.filter((goal) => goal.profileId === activeProfileId), [allGoals, activeProfileId]);
  const activeGoals = useMemo(() => goals.filter((goal) => goal.status === "active"), [goals]);
  const focusGoal = useMemo(() => [...activeGoals].sort((a, b) => (a.targetDate ?? "9999-12-31").localeCompare(b.targetDate ?? "9999-12-31"))[0], [activeGoals]);
  const habits = useMemo(() => allHabits.filter((habit) => habit.profileId === activeProfileId && isHabitDue(habit, today)), [allHabits, activeProfileId, today]);
  const day = days.find((item) => item.profileId === activeProfileId && item.date === today);
  const score = useMemo(() => calculateDailyScore(tasks, day), [tasks, day]);
  const yearTrend = useMemo(() => buildDailyInsights(allTasks.filter((task) => task.profileId === activeProfileId), habitLogs.filter((log) => log.profileId === activeProfileId), days.filter((item) => item.profileId === activeProfileId), new Date(), 365), [allTasks, habitLogs, days, activeProfileId]);
  const currentStreak = useMemo(
    () => activityStreak(
      allTasks.filter((task) => task.profileId === activeProfileId),
      habitLogs.filter((log) => log.profileId === activeProfileId),
      days.filter((item) => item.profileId === activeProfileId),
      today,
    ),
    [allTasks, habitLogs, days, activeProfileId, today],
  );
  const trend = yearTrend.slice(-7);
  const motivation = useMemo(() => chooseMotivation(today, allTasks.filter((task) => task.profileId === activeProfileId), goals, exposures.filter((item) => item.profileId === activeProfileId)), [today, allTasks, activeProfileId, goals, exposures]);
  const topTasks = tasks.filter((task) => task.isTopPriority && task.status !== "deferred");
  const otherTasks = tasks.filter((task) => !task.isTopPriority || task.status === "deferred");
  const dashboardTasks = [...topTasks, ...otherTasks];
  const remainingTasks = tasks.filter((task) => !["completed", "deferred", "skipped"].includes(task.status) && task.progress < 100);
  const nextTask = remainingTasks.find((task) => task.isTopPriority) ?? remainingTasks[0];
  const completedHabits = habits.filter((habit) => habitLogs.some((log) => log.habitId === habit.id && log.date === today)).length;
  const checkpoint = checkpoints.find((item) => item.profileId === activeProfileId && item.date === today);
  const focusGoalProgress = focusGoal ? Math.round(goalProgress(focusGoal)) : 0;
  const nextMilestone = focusGoal?.milestones.find((milestone) => !milestone.isCompleted);
  const goalDaysLeft = focusGoal?.targetDate ? differenceInCalendarDays(fromDateKey(focusGoal.targetDate), fromDateKey(today)) : null;
  const linkedTodayCount = focusGoal ? tasks.filter((task) => task.goalId === focusGoal.id && task.status !== "deferred").length : 0;
  const dateLabel = format(new Date(), "EEEE, d 'tháng' M", { locale: vi });
  const formattedDate = `${dateLabel.charAt(0).toUpperCase()}${dateLabel.slice(1)}`;
  const setupHref = `/calendar?view=day&date=${today}#day-setup`;

  useEffect(() => {
    recordMotivationExposure(today, motivation.kind);
  }, [motivation.kind, recordMotivationExposure, today]);

  function closePlanSaved() {
    setDismissedSavedDate(savedDate);
    router.replace("/today", { scroll: false });
  }

  return (
    <div className="page stack today-page">
      {showPlanSaved && savedDate ? (
        <div className="confirmation-backdrop">
          <section className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="plan-saved-title" aria-describedby="plan-saved-description">
            <CheckCircle2 size={32} aria-hidden="true" />
            <div>
              <h2 id="plan-saved-title">Đã lưu kế hoạch ngày</h2>
              <p id="plan-saved-description">Kế hoạch {format(fromDateKey(savedDate), "EEEE, d 'tháng' M", { locale: vi })} đã sẵn sàng. Bạn có thể theo dõi tiến độ ngay tại trang Hôm nay.</p>
            </div>
            <button className="button" type="button" autoFocus onClick={closePlanSaved}>Tiếp tục theo dõi</button>
          </section>
        </div>
      ) : null}
      <PageHeader
        today
        title={`Hôm nay của ${profile.name}`}
        subtitle={`${formattedDate} · ${remainingTasks.length} việc còn lại`}
        actions={<div className="today-header-tools">
          <div className="today-streak" aria-label={`Chuỗi hiện tại ${currentStreak} ngày`}>
            <Flame size={18} aria-hidden="true" />
            <span><small>Chuỗi hiện tại</small><strong className="num">{currentStreak} ngày</strong></span>
          </div>
          <Link className="button today-setup-toggle" href={setupHref} aria-label="Thiết lập ngày trong lịch">
            <SlidersHorizontal size={16} aria-hidden="true" />Thiết lập ngày
          </Link>
        </div>}
      />

      {day?.isRecoveryDay ? <div className="notice">Ngày phục hồi đang bật: ngày này không làm mất chuỗi hoạt động.</div> : null}

      <div className="today-top-grid">
        <QuickCheckpointCard date={today} tasks={tasks} checkpoint={checkpoint} checkpointTime={profile.preferences.checkpointTime} setupHref={setupHref} />

        <section className="today-motivation" aria-labelledby="motivation-title">
          <div>
            <h2 id="motivation-title">Động lực có bằng chứng</h2>
            <blockquote>{motivation.text}</blockquote>
          </div>
          <div className="motivation-next">
            <span>Nên làm tiếp</span>
            <strong>{nextTask?.title ?? "Thiết lập một việc rõ ràng cho hôm nay"}</strong>
            {nextTask ? <small className="num">{formatPercent(nextTask.progress)}% hoàn thành</small> : <Link className="text-action" href={setupHref}>Mở lịch để bắt đầu</Link>}
          </div>
        </section>
      </div>

      <section className="goal-spotlight" aria-labelledby="goal-spotlight-title">
        {focusGoal ? (
          <>
            <div className="goal-spotlight-main">
              <div className="goal-spotlight-heading"><div><h2 id="goal-spotlight-title">Mục tiêu dài hạn đang tiến tới</h2><h3>{focusGoal.title}</h3></div><strong className="num">{focusGoalProgress}%</strong></div>
              <ProgressBar value={focusGoalProgress} label={`Tiến độ ${focusGoal.title}`} />
              <p>{focusGoal.why ?? focusGoal.description ?? "Bổ sung lý do để mục tiêu này luôn hiện rõ ý nghĩa."}</p>
            </div>
            <div className="goal-spotlight-context">
              <dl>
                <div><dt>Cột mốc tiếp theo</dt><dd>{nextMilestone?.title ?? "Đã hoàn thành mọi cột mốc"}</dd></div>
                <div><dt>Hôm nay đóng góp</dt><dd className="num">{linkedTodayCount} việc</dd></div>
                <div><dt>Thời gian còn lại</dt><dd>{goalDaysLeft === null ? "Chưa đặt hạn" : goalDaysLeft < 0 ? `Quá hạn ${Math.abs(goalDaysLeft)} ngày` : `${goalDaysLeft} ngày`}</dd></div>
              </dl>
              <Link className="text-action" href="/goals">Mở chi tiết mục tiêu</Link>
            </div>
          </>
        ) : (
          <div className="goal-spotlight-empty">
            <div><h2 id="goal-spotlight-title">Chưa có mục tiêu dài hạn</h2><p>Tạo một mục tiêu và các cột mốc để mỗi ngày đều biết mình đang tiến về đâu.</p></div>
            <Link className="button" href="/goals">Tạo mục tiêu đầu tiên</Link>
          </div>
        )}
      </section>

      <ActivityHeatmap data={yearTrend} />

      <div className="grid-12 today-overview-grid">
        <section className="panel performance-panel span-8" aria-labelledby="performance-title">
          <div className="panel-title-row">
            <div><h2 className="panel-title" id="performance-title">Hiệu suất 7 ngày</h2><p className="panel-note performance-finding">Hôm nay: {score.completed}/{score.total} việc hoàn thành · {completedHabits}/{habits.length} thói quen</p></div>
            <Link href="/insights" className="panel-note">Xem phân tích</Link>
          </div>
          <TodayPerformance data={trend} percent={score.percent} />
        </section>

        <aside className="today-summary span-4" aria-label="Tóm tắt hôm nay">
          <div className="summary-lead">
            <span>Việc còn lại</span>
            <strong className="num">{remainingTasks.length}</strong>
            <p>{remainingTasks.length === 0 ? "Không còn việc đang chờ xử lý." : `${topTasks.filter((task) => task.progress < 100).length} việc thuộc Top 3.`}</p>
          </div>
          <dl className="summary-metrics">
            <div><dt>Tiến độ ngày</dt><dd className="num">{Math.round(score.percent)}<span>%</span></dd></div>
            <div><dt>Thói quen</dt><dd className="num">{completedHabits}<span>/{habits.length}</span></dd></div>
            <div><dt>Mục tiêu</dt><dd className="num">{activeGoals.length}</dd></div>
          </dl>
        </aside>
      </div>

      <div className="grid-12 today-work-grid">
        <section className="panel tonal span-8 today-tasks" aria-labelledby="tasks-title">
          <div className="panel-title-row"><div><h2 className="panel-title" id="tasks-title">Việc còn lại</h2><p className="panel-note">Cập nhật tiến độ nhanh ở đây; thiết lập đầy đủ nằm trong Lịch.</p></div><span className="status">{remainingTasks.length} đang chờ</span></div>
          <div className="task-list">
            {dashboardTasks.length ? dashboardTasks.map((task) => <TaskRow task={task} goals={goals} key={task.id} />) : <div className="empty-state"><span>Chưa có công việc cho hôm nay.</span><Link className="text-action" href={setupHref}>Thiết lập ngày trong lịch</Link></div>}
          </div>
        </section>

        <section className="panel habits-compact span-4" aria-labelledby="habits-title">
          <div className="panel-title-row"><h2 className="panel-title" id="habits-title">Thói quen hôm nay</h2><Link href="/habits" className="panel-note">Quản lý</Link></div>
          <div className="task-list">
            {habits.length ? habits.map((habit) => {
              const log = habitLogs.find((item) => item.habitId === habit.id && item.date === today);
              return <div className="habit-compact-row" key={habit.id}><div><strong>{habitNameForDate(habit, today)}</strong><span>{habit.name}{log?.completion === "minimum" ? " · tối thiểu" : ""}</span></div><div className="task-actions"><button type="button" className={`button compact ${log ? "secondary" : ""}`} onClick={() => logHabit(habit.id, today, log ? null : "standard")}>{log ? "Bỏ đánh dấu" : "Hoàn thành"}</button>{habit.minimumVersion && !log ? <button type="button" className="button ghost compact" onClick={() => logHabit(habit.id, today, "minimum")}>Tối thiểu</button> : null}</div></div>;
            }) : <div className="empty-state">Chưa có thói quen đến lịch hôm nay.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
