"use client";

import { useState, type FormEvent } from "react";
import { Pause, Play, Trash2 } from "lucide-react";
import type { Goal, HabitCategory } from "@/domain/types";
import { PageHeader } from "@/components/ui/page-header";
import { habitStreak } from "@/domain/streaks";
import { toDateKey } from "@/lib/dates";
import { HABIT_CATEGORIES, useAppStore } from "@/store/app-store";

const weekdays = [
  { value: 1, label: "T2" }, { value: 2, label: "T3" }, { value: 3, label: "T4" },
  { value: 4, label: "T5" }, { value: 5, label: "T6" }, { value: 6, label: "T7" }, { value: 0, label: "CN" },
];

function HabitForm({ goals }: { goals: Goal[] }) {
  const addHabit = useAppStore((state) => state.addHabit);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<HabitCategory>("study");
  const [scheduleType, setScheduleType] = useState<"fixed_days" | "weekly_target">("fixed_days");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]);
  const [weeklyTarget, setWeeklyTarget] = useState(3);
  const [basePoints, setBasePoints] = useState(10);
  const [minimumLabel, setMinimumLabel] = useState("");
  const [goalId, setGoalId] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    addHabit({
      name, category, scheduleType, basePoints, startDate: toDateKey(new Date()),
      weekdays: scheduleType === "fixed_days" ? selectedDays : undefined,
      weeklyTarget: scheduleType === "weekly_target" ? weeklyTarget : undefined,
      minimumVersion: minimumLabel.trim() ? { label: minimumLabel.trim(), pointMultiplier: 0.5 } : undefined,
      goalId: goalId || undefined,
    });
    setName(""); setMinimumLabel("");
  }

  return (
    <form className="panel stack" onSubmit={submit}>
      <div className="panel-title-row"><h2 className="panel-title">Tạo thói quen</h2><span className="panel-note">Phiên bản tối thiểu nhận 50% điểm</span></div>
      <div className="form-row">
        <div className="field"><label htmlFor="habit-name">Tên thói quen</label><input id="habit-name" name="habitName" autoComplete="off" className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Học Computer Vision…" maxLength={120} /></div>
        <div className="field"><label htmlFor="habit-category">Nhóm</label><select id="habit-category" name="habitCategory" autoComplete="off" className="select" value={category} onChange={(event) => setCategory(event.target.value as HabitCategory)}>{Object.entries(HABIT_CATEGORIES).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
        <div className="field"><label htmlFor="habit-points">Điểm mỗi lần</label><select id="habit-points" name="habitPoints" autoComplete="off" className="select" value={basePoints} onChange={(event) => setBasePoints(Number(event.target.value))}>{[5, 10, 20, 30].map((value) => <option value={value} key={value}>{value}</option>)}</select></div>
      </div>
      <div className="field"><span className="field-label">Kiểu lịch</span><div className="segmented"><button type="button" className={scheduleType === "fixed_days" ? "active" : ""} onClick={() => setScheduleType("fixed_days")}>Ngày cố định</button><button type="button" className={scheduleType === "weekly_target" ? "active" : ""} onClick={() => setScheduleType("weekly_target")}>Chỉ tiêu tuần</button></div></div>
      {scheduleType === "fixed_days" ? <fieldset className="weekday-picker"><legend>Ngày thực hiện</legend>{weekdays.map((day) => <label key={day.value}><input type="checkbox" name="habitWeekdays" value={day.value} checked={selectedDays.includes(day.value)} onChange={() => setSelectedDays((values) => values.includes(day.value) ? values.filter((value) => value !== day.value) : [...values, day.value])} />{day.label}</label>)}</fieldset> : <div className="field"><label htmlFor="weekly-target">Số lần mỗi tuần</label><input id="weekly-target" name="weeklyTarget" autoComplete="off" inputMode="numeric" className="input" type="number" min={1} max={7} value={weeklyTarget} onChange={(event) => setWeeklyTarget(Number(event.target.value))} /></div>}
      <div className="field"><label htmlFor="minimum-label">Phiên bản tối thiểu (không bắt buộc)</label><input id="minimum-label" name="minimumLabel" autoComplete="off" className="input" value={minimumLabel} onChange={(event) => setMinimumLabel(event.target.value)} placeholder="Ví dụ: Đọc 15 phút…" /></div>
      <div className="field"><label htmlFor="habit-goal">Mục tiêu liên quan</label><select id="habit-goal" name="habitGoal" autoComplete="off" className="select" value={goalId} onChange={(event) => setGoalId(event.target.value)}><option value="">Không liên kết</option>{goals.map((goal) => <option value={goal.id} key={goal.id}>{goal.title}</option>)}</select></div>
      <button className="button" type="submit">Tạo thói quen</button>
    </form>
  );
}

export function HabitsScreen() {
  const today = toDateKey(new Date());
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const habits = useAppStore((state) => state.habits).filter((habit) => habit.profileId === activeProfileId);
  const goals = useAppStore((state) => state.goals).filter((goal) => goal.profileId === activeProfileId && goal.status === "active");
  const logs = useAppStore((state) => state.habitLogs).filter((log) => log.profileId === activeProfileId);
  const days = useAppStore((state) => state.days).filter((day) => day.profileId === activeProfileId);
  const updateHabit = useAppStore((state) => state.updateHabit);
  const deleteHabit = useAppStore((state) => state.deleteHabit);
  const logHabit = useAppStore((state) => state.logHabit);
  return (
    <div className="page stack">
      <PageHeader title="Thói quen" subtitle="Lịch cố định giữ nhịp theo ngày; chỉ tiêu tuần cho phép linh hoạt ngày thực hiện." />
      <div className="grid-12"><div className="span-5"><HabitForm goals={goals} /></div><section className="span-7 stack" aria-label="Danh sách thói quen">
        {habits.length ? habits.map((habit) => {
          const log = logs.find((item) => item.habitId === habit.id && item.date === today);
          const schedule = habit.scheduleType === "weekly_target" ? `${habit.weeklyTarget} lần/tuần` : weekdays.filter((day) => habit.weekdays?.includes(day.value)).map((day) => day.label).join(" · ");
          return <article className="panel" key={habit.id}>
            <div className="panel-title-row"><div><h2 className="panel-title">{habit.name}</h2><p className="panel-note" style={{ margin: "5px 0 0" }}>{HABIT_CATEGORIES[habit.category]} · {schedule}</p></div><span className={`status ${habit.isActive ? "good" : ""}`}>{habit.isActive ? "Đang hoạt động" : "Tạm dừng"}</span></div>
            <div className="habit-metrics"><div><span>Chuỗi</span><strong className="num">{habitStreak(habit, logs, days, today)}</strong></div><div><span>Điểm chuẩn</span><strong className="num">{habit.basePoints}</strong></div><div><span>Hôm nay</span><strong>{log ? (log.completion === "minimum" ? "Tối thiểu" : "Đã xong") : "—"}</strong></div></div>
            {habit.minimumVersion ? <p className="panel-note">Bản tối thiểu: {habit.minimumVersion.label}</p> : null}
            <div className="task-actions" style={{ marginTop: 16 }}>
              <button className="button compact" type="button" onClick={() => logHabit(habit.id, today, log ? null : "standard")}>{log ? "Bỏ hoàn thành" : "Hoàn thành chuẩn"}</button>
              {habit.minimumVersion && !log ? <button className="button secondary compact" type="button" onClick={() => logHabit(habit.id, today, "minimum")}>Làm tối thiểu</button> : null}
              <button className="button ghost compact" type="button" onClick={() => updateHabit(habit.id, { isActive: !habit.isActive })}>{habit.isActive ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}{habit.isActive ? "Tạm dừng" : "Tiếp tục"}</button>
              <button className="button ghost compact icon-button" type="button" aria-label={`Xóa ${habit.name}`} onClick={() => deleteHabit(habit.id)}><Trash2 size={16} aria-hidden="true" /></button>
            </div>
          </article>;
        }) : <div className="empty-state">Chưa có thói quen. Tạo một lịch vừa sức để bắt đầu.</div>}
      </section></div>
    </div>
  );
}
