"use client";

import { useState, type FormEvent } from "react";
import type { Goal, HabitCategory, Priority } from "@/domain/types";
import { HABIT_CATEGORIES, PRIORITY_LABELS } from "@/store/app-store";

export function QuickAddTask({ date, goals, onAdd, label = "Thêm việc" }: {
  date: string;
  goals: Goal[];
  onAdd: (input: { title: string; date: string; priority: Priority; category: HabitCategory; isBinary: boolean; goalId?: string; checklist?: string[] }) => void;
  label?: string;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<HabitCategory>("study");
  const [goalId, setGoalId] = useState("");
  const [isBinary, setIsBinary] = useState(true);
  const [checklistText, setChecklistText] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    const checklist = checklistText.split("\n").map((item) => item.trim()).filter(Boolean);
    onAdd({ title: title.trim(), date, priority, category, isBinary: checklist.length ? false : isBinary, goalId: goalId || undefined, checklist: checklist.length ? checklist : undefined });
    setTitle("");
    setChecklistText("");
  }

  return (
    <form className="quick-add-task" onSubmit={submit}>
      <div className="quick-add-primary">
        <div className="field">
          <label htmlFor={`task-title-${date}`}>Tên công việc</label>
          <input id={`task-title-${date}`} name={`taskTitle-${date}`} autoComplete="off" className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Chạy baseline cho mô hình…" maxLength={160} />
        </div>
        <button className="button" type="submit">{label}</button>
      </div>
      <details className="quick-add-options">
        <summary>Tùy chọn nâng cao</summary>
        <div className="quick-add-secondary">
          <div className="field">
            <label htmlFor={`task-priority-${date}`}>Mức độ</label>
            <select id={`task-priority-${date}`} name={`taskPriority-${date}`} autoComplete="off" className="select" value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
              {(Object.keys(PRIORITY_LABELS) as Priority[]).map((value) => <option value={value} key={value}>{PRIORITY_LABELS[value]}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`task-category-${date}`}>Nhóm</label>
            <select id={`task-category-${date}`} name={`taskCategory-${date}`} autoComplete="off" className="select" value={category} onChange={(event) => setCategory(event.target.value as HabitCategory)}>
              {(Object.keys(HABIT_CATEGORIES) as HabitCategory[]).map((value) => <option value={value} key={value}>{HABIT_CATEGORIES[value]}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`task-goal-${date}`}>Mục tiêu liên quan</label>
            <select id={`task-goal-${date}`} name={`taskGoal-${date}`} autoComplete="off" className="select" value={goalId} onChange={(event) => setGoalId(event.target.value)}>
              <option value="">Không liên kết</option>
              {goals.map((goal) => <option value={goal.id} key={goal.id}>{goal.title}</option>)}
            </select>
          </div>
          <label className="quick-add-progressive">
            <input type="checkbox" name={`progressive-${date}`} checked={!isBinary} onChange={(event) => setIsBinary(!event.target.checked)} />
            Theo tiến độ (25/50/75/100%)
          </label>
          <div className="field quick-add-checklist">
            <label htmlFor={`task-checklist-${date}`}>Checklist nhỏ (mỗi dòng một mục)</label>
            <textarea
              id={`task-checklist-${date}`}
              name={`taskChecklist-${date}`}
              className="textarea"
              value={checklistText}
              onChange={(event) => setChecklistText(event.target.value)}
              placeholder={"Ví dụ:\nChuẩn bị dữ liệu\nChạy thử mô hình\nGhi lại kết quả"}
              maxLength={1200}
            />
            <span className="field-hint">Tiến độ công việc sẽ tự tính theo số mục đã hoàn thành.</span>
          </div>
        </div>
      </details>
    </form>
  );
}
