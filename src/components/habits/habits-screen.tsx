"use client";

import { useState, type FormEvent } from "react";
import { Pause, Pencil, Play, Trash2 } from "lucide-react";
import type { Goal, Habit, HabitCategory, Weekday } from "@/domain/types";
import { PageHeader } from "@/components/ui/page-header";
import { habitNameForDate, habitNameForWeekday, isHabitDue } from "@/domain/scheduling";
import { habitStreak } from "@/domain/streaks";
import { toDateKey } from "@/lib/dates";
import { HABIT_CATEGORIES, useAppStore } from "@/store/app-store";

const weekdays: { value: Weekday; label: string; longLabel: string }[] = [
  { value: 1, label: "T2", longLabel: "Thứ Hai" },
  { value: 2, label: "T3", longLabel: "Thứ Ba" },
  { value: 3, label: "T4", longLabel: "Thứ Tư" },
  { value: 4, label: "T5", longLabel: "Thứ Năm" },
  { value: 5, label: "T6", longLabel: "Thứ Sáu" },
  { value: 6, label: "T7", longLabel: "Thứ Bảy" },
  { value: 0, label: "CN", longLabel: "Chủ Nhật" },
];

function FixedDayFields({ selectedDays, dayNames, fallbackName, onToggleDay, onNameChange }: {
  selectedDays: Weekday[];
  dayNames: Partial<Record<Weekday, string>>;
  fallbackName: string;
  onToggleDay: (weekday: Weekday) => void;
  onNameChange: (weekday: Weekday, name: string) => void;
}) {
  return (
    <div className="habit-week-plan">
      <fieldset className="weekday-picker">
        <legend>Ngày thực hiện</legend>
        {weekdays.map((day) => (
          <label key={day.value}>
            <input type="checkbox" name="habitWeekdays" value={day.value} checked={selectedDays.includes(day.value)} onChange={() => onToggleDay(day.value)} />
            {day.label}
          </label>
        ))}
      </fieldset>
      {selectedDays.length ? (
        <div className="habit-day-plans">
          <div>
            <strong>Hoạt động riêng từng ngày</strong>
            <span>Để trống nếu ngày đó dùng tên lịch chung.</span>
          </div>
          {weekdays.filter((day) => selectedDays.includes(day.value)).map((day) => (
            <label className="habit-day-plan" key={day.value}>
              <span>{day.longLabel}</span>
              <input
                className="input"
                value={dayNames[day.value] ?? ""}
                onChange={(event) => onNameChange(day.value, event.target.value)}
                placeholder={fallbackName.trim() ? `Mặc định: ${fallbackName.trim()}` : "Ví dụ: Gym, chạy bộ…"}
                maxLength={120}
                aria-label={`Hoạt động ${day.longLabel}`}
              />
            </label>
          ))}
        </div>
      ) : <p className="error">Chọn ít nhất một ngày trong tuần.</p>}
    </div>
  );
}

function buildDayPlans(selectedDays: Weekday[], dayNames: Partial<Record<Weekday, string>>) {
  return selectedDays.flatMap((weekday) => {
    const name = dayNames[weekday]?.trim();
    return name ? [{ weekday, name }] : [];
  });
}

function validWeekdays(values: number[] | undefined): Weekday[] {
  return (values ?? []).filter((value): value is Weekday => Number.isInteger(value) && value >= 0 && value <= 6);
}

function HabitForm({ goals }: { goals: Goal[] }) {
  const addHabit = useAppStore((state) => state.addHabit);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<HabitCategory>("study");
  const [scheduleType, setScheduleType] = useState<"fixed_days" | "weekly_target">("fixed_days");
  const [selectedDays, setSelectedDays] = useState<Weekday[]>([1, 3, 5]);
  const [dayNames, setDayNames] = useState<Partial<Record<Weekday, string>>>({});
  const [weeklyTarget, setWeeklyTarget] = useState(3);
  const [minimumLabel, setMinimumLabel] = useState("");
  const [goalId, setGoalId] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || (scheduleType === "fixed_days" && !selectedDays.length)) return;
    addHabit({
      name,
      category,
      scheduleType,
      basePoints: 10,
      startDate: toDateKey(new Date()),
      weekdays: scheduleType === "fixed_days" ? selectedDays : undefined,
      dayPlans: scheduleType === "fixed_days" ? buildDayPlans(selectedDays, dayNames) : undefined,
      weeklyTarget: scheduleType === "weekly_target" ? weeklyTarget : undefined,
      minimumVersion: minimumLabel.trim() ? { label: minimumLabel.trim(), pointMultiplier: 0.5 } : undefined,
      goalId: goalId || undefined,
    });
    setName("");
    setMinimumLabel("");
    setDayNames({});
  }

  function toggleDay(weekday: Weekday) {
    setSelectedDays((values) => values.includes(weekday) ? values.filter((value) => value !== weekday) : [...values, weekday]);
  }

  return (
    <form className="panel stack" onSubmit={submit}>
      <div className="panel-title-row"><h2 className="panel-title">Tạo lịch thói quen</h2><span className="panel-note">Có thể đặt hoạt động khác nhau cho từng ngày</span></div>
      <div className="form-row">
        <div className="field"><label htmlFor="habit-name">Tên thói quen</label><input id="habit-name" name="habitName" autoComplete="off" className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Lịch vận động tuần" maxLength={120} /></div>
        <div className="field"><label htmlFor="habit-category">Nhóm</label><select id="habit-category" name="habitCategory" autoComplete="off" className="select" value={category} onChange={(event) => setCategory(event.target.value as HabitCategory)}>{Object.entries(HABIT_CATEGORIES).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
      </div>
      <div className="field"><span className="field-label">Kiểu lịch</span><div className="segmented"><button type="button" className={scheduleType === "fixed_days" ? "active" : ""} onClick={() => setScheduleType("fixed_days")}>Theo từng ngày</button><button type="button" className={scheduleType === "weekly_target" ? "active" : ""} onClick={() => setScheduleType("weekly_target")}>Chỉ tiêu tuần</button></div></div>
      {scheduleType === "fixed_days" ? (
        <FixedDayFields selectedDays={selectedDays} dayNames={dayNames} fallbackName={name} onToggleDay={toggleDay} onNameChange={(weekday, value) => setDayNames((current) => ({ ...current, [weekday]: value }))} />
      ) : <div className="field"><label htmlFor="weekly-target">Số lần mỗi tuần</label><input id="weekly-target" name="weeklyTarget" autoComplete="off" inputMode="numeric" className="input" type="number" min={1} max={7} value={weeklyTarget} onChange={(event) => setWeeklyTarget(Number(event.target.value))} /></div>}
      <div className="field"><label htmlFor="minimum-label">Phiên bản tối thiểu (không bắt buộc)</label><input id="minimum-label" name="minimumLabel" autoComplete="off" className="input" value={minimumLabel} onChange={(event) => setMinimumLabel(event.target.value)} placeholder="Ví dụ: Tập 10 phút…" /></div>
      <div className="field"><label htmlFor="habit-goal">Mục tiêu liên quan</label><select id="habit-goal" name="habitGoal" autoComplete="off" className="select" value={goalId} onChange={(event) => setGoalId(event.target.value)}><option value="">Không liên kết</option>{goals.map((goal) => <option value={goal.id} key={goal.id}>{goal.title}</option>)}</select></div>
      <button className="button" type="submit" disabled={!name.trim() || (scheduleType === "fixed_days" && !selectedDays.length)}>Tạo thói quen</button>
    </form>
  );
}

function HabitScheduleEditor({ habit, onClose }: { habit: Habit; onClose: () => void }) {
  const updateHabit = useAppStore((state) => state.updateHabit);
  const [name, setName] = useState(habit.name);
  const [scheduleType, setScheduleType] = useState(habit.scheduleType);
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(() => validWeekdays(habit.weekdays));
  const [dayNames, setDayNames] = useState<Partial<Record<Weekday, string>>>(() => Object.fromEntries((habit.dayPlans ?? []).map((plan) => [plan.weekday, plan.name])));
  const [weeklyTarget, setWeeklyTarget] = useState(habit.weeklyTarget ?? 3);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || (scheduleType === "fixed_days" && !selectedDays.length)) return;
    updateHabit(habit.id, {
      name: name.trim(),
      scheduleType,
      weekdays: scheduleType === "fixed_days" ? selectedDays : undefined,
      dayPlans: scheduleType === "fixed_days" ? buildDayPlans(selectedDays, dayNames) : undefined,
      weeklyTarget: scheduleType === "weekly_target" ? weeklyTarget : undefined,
    });
    onClose();
  }

  return (
    <form className="habit-schedule-editor" onSubmit={submit}>
      <div className="field"><label htmlFor={`edit-habit-${habit.id}`}>Tên lịch thói quen</label><input id={`edit-habit-${habit.id}`} className="input" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} /></div>
      <div className="segmented"><button type="button" className={scheduleType === "fixed_days" ? "active" : ""} onClick={() => setScheduleType("fixed_days")}>Theo từng ngày</button><button type="button" className={scheduleType === "weekly_target" ? "active" : ""} onClick={() => setScheduleType("weekly_target")}>Chỉ tiêu tuần</button></div>
      {scheduleType === "fixed_days" ? (
        <FixedDayFields
          selectedDays={selectedDays}
          dayNames={dayNames}
          fallbackName={name}
          onToggleDay={(weekday) => setSelectedDays((values) => values.includes(weekday) ? values.filter((value) => value !== weekday) : [...values, weekday])}
          onNameChange={(weekday, value) => setDayNames((current) => ({ ...current, [weekday]: value }))}
        />
      ) : <div className="field"><label htmlFor={`edit-target-${habit.id}`}>Số lần mỗi tuần</label><input id={`edit-target-${habit.id}`} className="input" type="number" min={1} max={7} value={weeklyTarget} onChange={(event) => setWeeklyTarget(Number(event.target.value))} /></div>}
      <div className="habit-editor-actions"><button className="button compact" type="submit">Lưu lịch tuần</button><button className="button ghost compact" type="button" onClick={onClose}>Hủy</button></div>
    </form>
  );
}

export function HabitsScreen() {
  const today = toDateKey(new Date());
  const [editingId, setEditingId] = useState<string>();
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
      <PageHeader title="Thói quen" subtitle="Lập nhịp riêng cho từng ngày — ví dụ Thứ Hai gym, Thứ Ba chạy bộ." />
      <div className="grid-12 habits-layout"><div className="span-5"><HabitForm goals={goals} /></div><section className="span-7 stack" aria-label="Danh sách thói quen">
        {habits.length ? habits.map((habit) => {
          const log = logs.find((item) => item.habitId === habit.id && item.date === today);
          const dueToday = isHabitDue(habit, today);
          const todayName = habitNameForDate(habit, today);
          const schedule = habit.scheduleType === "weekly_target"
            ? `${habit.weeklyTarget} lần/tuần`
            : weekdays.filter((day) => habit.weekdays?.includes(day.value)).map((day) => `${day.label}: ${habitNameForWeekday(habit, day.value)}`).join(" · ");
          return <article className="panel habit-card" key={habit.id}>
            <div className="panel-title-row"><div><h2 className="panel-title">{habit.name}</h2><p className="panel-note habit-schedule-summary">{HABIT_CATEGORIES[habit.category]} · {schedule}</p></div><span className={`status ${habit.isActive ? "good" : ""}`}>{habit.isActive ? "Đang hoạt động" : "Tạm dừng"}</span></div>
            {dueToday && todayName !== habit.name ? <p className="habit-today-activity"><span>Hôm nay</span><strong>{todayName}</strong></p> : null}
            <div className="habit-metrics"><div><span>Chuỗi</span><strong className="num">{habitStreak(habit, logs, days, today)}</strong></div><div><span>Lịch tuần</span><strong>{habit.scheduleType === "fixed_days" ? `${habit.weekdays?.length ?? 0} ngày` : `${habit.weeklyTarget} lần`}</strong></div><div><span>Hôm nay</span><strong>{log ? (log.completion === "minimum" ? "Tối thiểu" : "Đã xong") : dueToday ? "Chưa làm" : "Nghỉ"}</strong></div></div>
            {habit.minimumVersion ? <p className="panel-note">Bản tối thiểu: {habit.minimumVersion.label}</p> : null}
            {editingId === habit.id ? <HabitScheduleEditor habit={habit} onClose={() => setEditingId(undefined)} /> : null}
            <div className="task-actions habit-card-actions">
              {dueToday ? <button className="button compact" type="button" onClick={() => logHabit(habit.id, today, log ? null : "standard")}>{log ? "Bỏ hoàn thành" : "Hoàn thành"}</button> : null}
              {habit.minimumVersion && dueToday && !log ? <button className="button secondary compact" type="button" onClick={() => logHabit(habit.id, today, "minimum")}>Làm tối thiểu</button> : null}
              <button className="button ghost compact" type="button" aria-expanded={editingId === habit.id} onClick={() => setEditingId((current) => current === habit.id ? undefined : habit.id)}><Pencil size={15} aria-hidden="true" />Chỉnh lịch</button>
              <button className="button ghost compact" type="button" onClick={() => updateHabit(habit.id, { isActive: !habit.isActive })}>{habit.isActive ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}{habit.isActive ? "Tạm dừng" : "Tiếp tục"}</button>
              <button className="button ghost compact icon-button" type="button" aria-label={`Xóa ${habit.name}`} onClick={() => deleteHabit(habit.id)}><Trash2 size={16} aria-hidden="true" /></button>
            </div>
          </article>;
        }) : <div className="empty-state">Chưa có thói quen. Tạo một lịch vừa sức để bắt đầu.</div>}
      </section></div>
    </div>
  );
}
