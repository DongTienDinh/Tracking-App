"use client";

import { useState, type FormEvent } from "react";
import { differenceInCalendarDays } from "date-fns";
import { Archive, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { goalProgress } from "@/domain/goals";
import { toDateKey } from "@/lib/dates";
import { useAppStore } from "@/store/app-store";

function GoalForm() {
  const addGoal = useAppStore((state) => state.addGoal);
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");
  const [targetDate, setTargetDate] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    addGoal({ title, why: why || undefined, startDate: toDateKey(new Date()), targetDate: targetDate || undefined });
    setTitle(""); setWhy(""); setTargetDate("");
  }
  return (
    <form className="panel stack" onSubmit={submit}>
      <h2 className="panel-title">Tạo mục tiêu</h2>
      <div className="field"><label htmlFor="goal-title">Tên mục tiêu</label><input id="goal-title" name="goalTitle" autoComplete="off" className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Hoàn thành đồ án Computer Vision…" /></div>
      <div className="field"><label htmlFor="goal-why">Tại sao mục tiêu này quan trọng?</label><textarea id="goal-why" name="goalWhy" autoComplete="off" className="textarea" value={why} onChange={(event) => setWhy(event.target.value)} placeholder="Lý do đủ cụ thể để đọc lại khi mất nhịp…" /></div>
      <div className="field"><label htmlFor="goal-target">Ngày dự kiến hoàn thành</label><input id="goal-target" name="goalTarget" autoComplete="off" className="input" type="date" min={toDateKey(new Date())} value={targetDate} onChange={(event) => setTargetDate(event.target.value)} /></div>
      <button className="button" type="submit">Tạo mục tiêu</button>
    </form>
  );
}

function MilestoneForm({ goalId }: { goalId: string }) {
  const addMilestone = useAppStore((state) => state.addMilestone);
  const [title, setTitle] = useState("");
  const [weight, setWeight] = useState(1);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!title.trim()) return; addMilestone(goalId, title, weight); setTitle(""); setWeight(1); }
  return <form className="form-row" onSubmit={submit}><div className="field"><label htmlFor={`milestone-${goalId}`}>Cột mốc mới</label><input id={`milestone-${goalId}`} name={`milestone-${goalId}`} autoComplete="off" className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Xây dựng baseline…" /></div><div className="field" style={{ maxWidth: 100 }}><label htmlFor={`weight-${goalId}`}>Trọng số</label><input id={`weight-${goalId}`} name={`weight-${goalId}`} autoComplete="off" inputMode="numeric" className="input" type="number" min={1} max={100} value={weight} onChange={(event) => setWeight(Number(event.target.value))} /></div><button className="button secondary" type="submit">Thêm</button></form>;
}

export function GoalsScreen() {
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const goals = useAppStore((state) => state.goals).filter((goal) => goal.profileId === activeProfileId && goal.status !== "archived");
  const tasks = useAppStore((state) => state.tasks);
  const habits = useAppStore((state) => state.habits);
  const habitLogs = useAppStore((state) => state.habitLogs);
  const toggleMilestone = useAppStore((state) => state.toggleMilestone);
  const updateGoal = useAppStore((state) => state.updateGoal);
  const deleteGoal = useAppStore((state) => state.deleteGoal);

  return (
    <div className="page stack">
      <PageHeader title="Mục tiêu" subtitle="Tiến độ được tính từ trọng số các cột mốc, không suy đoán từ số lượng task." />
      <div className="grid-12"><aside className="span-4"><GoalForm /></aside><section className="span-8 stack" aria-label="Mục tiêu đang theo đuổi">
        {goals.length ? goals.map((goal) => {
          const linkedTasks = tasks.filter((task) => task.goalId === goal.id);
          const linkedHabits = habits.filter((habit) => habit.goalId === goal.id);
          const linkedHabitIds = new Set(linkedHabits.map((habit) => habit.id));
          const latestTask = linkedTasks.map((task) => task.updatedAt).sort().at(-1);
          const latestHabit = habitLogs.filter((log) => linkedHabitIds.has(log.habitId)).map((log) => log.completedAt).sort().at(-1);
          const latest = [latestTask, latestHabit, `${goal.startDate}T00:00:00.000Z`].filter(Boolean).sort().at(-1)!;
          const inactiveDays = differenceInCalendarDays(new Date(), new Date(latest));
          const progress = goalProgress(goal);
          return <article className="panel" key={goal.id}>
            <div className="panel-title-row"><div><h2 className="panel-title">{goal.title}</h2><p className="panel-note" style={{ margin: "5px 0 0" }}>{goal.targetDate ? `Mục tiêu ${goal.targetDate}` : "Không đặt hạn"} · {linkedTasks.length} việc · {linkedHabits.length} thói quen</p></div><span className="kpi-value" style={{ fontSize: 26 }}>{Math.round(progress)}%</span></div>
            <ProgressBar value={progress} label={`Tiến độ ${goal.title}`} />
            {inactiveDays >= 8 ? <div className="notice" style={{ marginTop: 16 }}><strong>{inactiveDays} ngày chưa có hoạt động liên quan.</strong>{goal.why ? <span> {goal.why}</span> : <span> Hãy thêm một cột mốc nhỏ hoặc liên kết task gần nhất.</span>}</div> : null}
            <div className="milestone-list">
              {goal.milestones.map((milestone) => <label key={milestone.id}><input className="checkbox" type="checkbox" checked={milestone.isCompleted} onChange={() => toggleMilestone(goal.id, milestone.id)} /><span className={milestone.isCompleted ? "completed-text" : ""}>{milestone.title}</span><span className="num">{milestone.weight}</span></label>)}
              {goal.milestones.length === 0 ? <div className="empty-state">Chưa có cột mốc. Thêm ít nhất một cột mốc để đo tiến độ.</div> : null}
            </div>
            <MilestoneForm goalId={goal.id} />
            <div className="task-actions" style={{ marginTop: 16 }}><button className="button ghost compact" type="button" onClick={() => updateGoal(goal.id, { status: goal.status === "paused" ? "active" : "paused" })}>{goal.status === "paused" ? "Tiếp tục" : "Tạm dừng"}</button><button className="button ghost compact" type="button" onClick={() => updateGoal(goal.id, { status: "archived" })}><Archive size={15} aria-hidden="true" />Lưu trữ</button><button className="button ghost compact icon-button" type="button" aria-label={`Xóa ${goal.title}`} onClick={() => deleteGoal(goal.id)}><Trash2 size={16} aria-hidden="true" /></button></div>
          </article>;
        }) : <div className="empty-state">Chưa có mục tiêu. Hãy bắt đầu bằng một kết quả có thể chia thành cột mốc.</div>}
      </section></div>
    </div>
  );
}
