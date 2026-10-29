"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckpointForm } from "@/components/checkpoint/checkpoint-form";
import { DailyNoteEditor } from "@/components/notes/daily-note-editor";
import { DailyReviewPanel } from "@/components/tasks/daily-review";
import { QuickAddTask } from "@/components/tasks/quick-add-task";
import { TaskRow } from "@/components/tasks/task-row";
import { calculateDailyScore } from "@/domain/scoring";
import { habitNameForDate, isHabitDue } from "@/domain/scheduling";
import { fromDateKey } from "@/lib/dates";
import { useAppStore } from "@/store/app-store";

export function DaySetupWorkspace({ date }: { date: string }) {
  const router = useRouter();
  const [trackingOpen, setTrackingOpen] = useState(() => typeof window !== "undefined" && window.location.hash === "#checkpoint");
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const allTasks = useAppStore((state) => state.tasks);
  const allHabits = useAppStore((state) => state.habits);
  const habitLogs = useAppStore((state) => state.habitLogs);
  const allGoals = useAppStore((state) => state.goals);
  const checkpoints = useAppStore((state) => state.checkpoints);
  const notes = useAppStore((state) => state.notes);
  const reviews = useAppStore((state) => state.reviews);
  const days = useAppStore((state) => state.days);
  const addTask = useAppStore((state) => state.addTask);
  const setTopPriority = useAppStore((state) => state.setTopPriority);
  const logHabit = useAppStore((state) => state.logHabit);
  const saveCheckpoint = useAppStore((state) => state.saveCheckpoint);
  const saveNote = useAppStore((state) => state.saveNote);
  const confirmPlan = useAppStore((state) => state.confirmPlan);
  const completeReview = useAppStore((state) => state.completeReview);
  const setRecoveryDay = useAppStore((state) => state.setRecoveryDay);

  const tasks = useMemo(() => allTasks.filter((task) => task.profileId === activeProfileId && task.date === date), [allTasks, activeProfileId, date]);
  const goals = useMemo(() => allGoals.filter((goal) => goal.profileId === activeProfileId), [allGoals, activeProfileId]);
  const habits = useMemo(() => allHabits.filter((habit) => habit.profileId === activeProfileId && isHabitDue(habit, date)), [allHabits, activeProfileId, date]);
  const day = days.find((item) => item.profileId === activeProfileId && item.date === date);
  const checkpoint = checkpoints.find((item) => item.profileId === activeProfileId && item.date === date);
  const note = notes.find((item) => item.profileId === activeProfileId && item.date === date);
  const review = reviews.find((item) => item.profileId === activeProfileId && item.date === date);
  const score = useMemo(() => calculateDailyScore(tasks, day), [tasks, day]);
  const topTasks = tasks.filter((task) => task.isTopPriority && task.status !== "deferred");
  const highPriorityCount = tasks.filter((task) => ["important", "critical"].includes(task.priority) && task.status !== "deferred").length;
  const completedHabits = habits.filter((habit) => habitLogs.some((log) => log.habitId === habit.id && log.date === date)).length;
  const trackingCount = Number(Boolean(checkpoint)) + Number(Boolean(note?.content.trim())) + Number(Boolean(review));
  const dateLabel = format(fromDateKey(date), "EEEE, d 'tháng' M", { locale: vi });

  function addWithTopCandidate(input: Parameters<typeof addTask>[0]) {
    const id = addTask(input);
    if (topTasks.length < 3) setTopPriority(id, true);
  }

  function confirmAndOpenToday() {
    confirmPlan(date);
    router.push(`/today?planSaved=${date}`);
  }

  return (
    <section className="day-setup calendar-day-setup" id="day-setup" aria-labelledby="day-setup-title">
      <div className="day-setup-heading">
        <div>
          <h2 id="day-setup-title">Thiết lập ngày</h2>
          <p>{dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)} · thêm việc, chọn Top 3 rồi xác nhận.</p>
        </div>
        <details className="day-options" open={day?.isRecoveryDay || undefined}>
          <summary>Tùy chọn ngày</summary>
          <button className="button secondary" type="button" onClick={() => setRecoveryDay(date, !day?.isRecoveryDay)}>
            <RotateCcw size={16} aria-hidden="true" />{day?.isRecoveryDay ? "Tắt ngày phục hồi" : "Bật ngày phục hồi"}
          </button>
        </details>
      </div>

      {day?.isRecoveryDay ? <div className="recovery-note">Ngày phục hồi đang bật: ngày này không làm mất chuỗi hoạt động.</div> : null}

      <div className="day-setup-facts" aria-label="Tóm tắt thiết lập ngày">
        <span><strong className="num">{tasks.length}</strong> việc</span>
        <span><strong className="num">{topTasks.length}/3</strong> ưu tiên</span>
        <span><strong className="num">{habits.length ? `${completedHabits}/${habits.length}` : "0"}</strong> thói quen</span>
      </div>

      <div className="grid-12 day-plan-grid">
        <section className="panel span-8 day-plan-main" aria-labelledby="day-plan-title">
          <div className="panel-title-row">
            <div><h3 className="panel-title" id="day-plan-title">Kế hoạch và công việc</h3><p className="panel-note setup-copy">Thêm nhanh một việc; ba việc đầu tiên tự động vào Top 3.</p></div>
            {day?.planConfirmedAt ? <span className="status good">Đã xác nhận</span> : null}
          </div>
          {highPriorityCount > 5 ? <div className="notice setup-notice">Có {highPriorityCount} việc quan trọng hoặc cực kỳ quan trọng. Nên giảm tải trước khi xác nhận.</div> : null}
          <QuickAddTask date={date} goals={goals} onAdd={addWithTopCandidate} />
          <div className="task-list setup-task-list">
            {tasks.length ? tasks.map((task) => <TaskRow task={task} goals={goals} variant="setup" key={task.id} />) : <div className="empty-state">Chưa có việc nào. Hãy thêm một kết quả cụ thể cho ngày này.</div>}
          </div>
          <div className="day-plan-footer">
            <span className="panel-note num">{tasks.length} việc · {Math.round(score.percent)}% hoàn thành</span>
            <button className="button" type="button" disabled={tasks.length === 0} onClick={confirmAndOpenToday}>{day?.planConfirmedAt ? "Cập nhật kế hoạch" : "Xác nhận kế hoạch"}</button>
          </div>
        </section>

        <aside className="panel span-4 habits-compact day-habits" aria-labelledby="day-habits-title">
          <div className="panel-title-row"><div><h3 className="panel-title" id="day-habits-title">Thói quen hôm nay</h3><p className="panel-note">Tick ngay khi hoàn thành.</p></div><Link href="/habits" className="panel-note">Quản lý</Link></div>
          <div className="task-list">
            {habits.length ? habits.map((habit) => {
              const log = habitLogs.find((item) => item.habitId === habit.id && item.date === date);
              return <div className="habit-compact-row" data-completed={Boolean(log)} key={habit.id}><div><strong>{habitNameForDate(habit, date)}</strong><span>{habit.name}{log?.completion === "minimum" ? " · tối thiểu" : ""}</span></div><div className="task-actions"><button type="button" className={`button compact ${log ? "secondary" : ""}`} onClick={() => logHabit(habit.id, date, log ? null : "standard")}>{log ? "Bỏ đánh dấu" : "Hoàn thành"}</button>{habit.minimumVersion && !log ? <button type="button" className="button ghost compact" onClick={() => logHabit(habit.id, date, "minimum")}>Tối thiểu</button> : null}</div></div>;
            }) : <div className="empty-state"><span>Không có thói quen đến lịch.</span><Link className="text-action" href="/habits">Thiết lập thói quen</Link></div>}
          </div>
        </aside>
      </div>

      <details className="day-tracking" id="checkpoint" open={trackingOpen} onToggle={(event) => setTrackingOpen(event.currentTarget.open)}>
        <summary>
          <span><strong>Theo dõi và tổng kết</strong><small>Checkpoint, ghi chú và review cuối ngày khi bạn cần.</small></span>
          <span className="num">{trackingCount}/3</span>
        </summary>
        <div className="grid-12 day-reflection-grid">
          <section className="panel span-6" aria-labelledby="checkpoint-title">
            <div className="panel-title-row"><h3 className="panel-title" id="checkpoint-title">Checkpoint giữa ngày</h3>{checkpoint ? <span className="status good">Đã lưu · {Math.round(checkpoint.completionPercent)}%</span> : <span className="panel-note">30–60 giây</span>}</div>
            <CheckpointForm tasks={tasks} existing={checkpoint} onSave={(energy, nextTaskId, noteValue, planChanges) => saveCheckpoint(date, energy, nextTaskId, noteValue, planChanges)} />
          </section>

          <section className="panel span-6" aria-labelledby="note-title">
            <div className="panel-title-row"><h3 className="panel-title" id="note-title">Ghi chú trong ngày</h3><Link href="/notes" className="panel-note">Mở kho ghi chú</Link></div>
            <DailyNoteEditor key={note?.id ?? date} initialContent={note?.content ?? ""} onSave={(content) => saveNote(date, content)} />
          </section>

          <section className="panel span-12" aria-labelledby="review-title">
            <div className="panel-title-row"><h3 className="panel-title" id="review-title">Tổng kết cuối ngày</h3>{review ? <span className="status good">Đã hoàn thành</span> : null}</div>
            <DailyReviewPanel key={review?.id ?? date} existing={review} onComplete={(noteValue) => completeReview(date, noteValue)} />
          </section>
        </div>
      </details>
    </section>
  );
}
