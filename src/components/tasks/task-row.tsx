"use client";

import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import type { DailyTask, Goal, HabitCategory, Priority, Progress } from "@/domain/types";
import { DEFAULT_DEFER_REASON, DEFAULT_SKIP_REASONS, HABIT_CATEGORIES, PRIORITY_LABELS, tomorrowKey, useAppStore } from "@/store/app-store";

const progressValues: Progress[] = [0, 25, 50, 75, 100];

export function TaskRow({ task, goals, variant = "full" }: { task: DailyTask; goals: Goal[]; variant?: "full" | "setup" }) {
  const [reason, setReason] = useState<(typeof DEFAULT_SKIP_REASONS)[number]>("Thiếu thời gian");
  const setProgress = useAppStore((state) => state.setTaskProgress);
  const updateTask = useAppStore((state) => state.updateTask);
  const setTopPriority = useAppStore((state) => state.setTopPriority);
  const deferTask = useAppStore((state) => state.deferTask);
  const skipTask = useAppStore((state) => state.skipTask);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const goal = goals.find((item) => item.id === task.goalId);
  const isActionable = task.status !== "deferred" && task.status !== "skipped";

  const progressControl = task.isBinary ? (
    <label className="button secondary compact">
      <input className="checkbox" type="checkbox" name={`complete-${task.id}`} checked={task.progress === 100} onChange={(event) => setProgress(task.id, event.target.checked ? 100 : 0)} /> Xong
    </label>
  ) : (
    <select className="select" name={`progress-${task.id}`} autoComplete="off" aria-label={`Tiến độ ${task.title}`} value={task.progress} onChange={(event) => setProgress(task.id, Number(event.target.value) as Progress)}>
      {progressValues.map((value) => <option value={value} key={value}>{value}%</option>)}
    </select>
  );

  const topPriorityControl = (
    <button type="button" className="button secondary compact icon-button" aria-label={task.isTopPriority ? `Bỏ ${task.title} khỏi Top 3` : `Đưa ${task.title} vào Top 3`} aria-pressed={task.isTopPriority} onClick={() => setTopPriority(task.id, !task.isTopPriority)}>
      <Star size={17} fill={task.isTopPriority ? "currentColor" : "none"} aria-hidden="true" />
    </button>
  );

  if (variant === "setup") {
    return (
      <article className="task-row setup-task-row" data-testid="task-row">
        <div className="task-main">
          <div className="task-title">{task.title}</div>
          <div className="task-meta">
            <span>{PRIORITY_LABELS[task.priority]}</span>
            <span className="num">{task.progress}%</span>
            {goal ? <span>{goal.title}</span> : null}
            {task.status === "deferred" ? <span className="status warning">Đã hoãn đến {task.deferredTo}</span> : null}
            {task.status === "skipped" ? <span className="status bad">Đã bỏ · {task.skipReason}</span> : null}
          </div>
        </div>
        <div className="task-actions setup-task-actions">
          {isActionable ? <>{progressControl}{topPriorityControl}</> : null}
        </div>
        <details className="task-adjustments">
          <summary aria-label={`Tùy chỉnh ${task.title}`}>Tùy chỉnh</summary>
          {isActionable ? (
            <div className="task-adjustment-fields">
              <div className="field">
                <label htmlFor={`priority-${task.id}`}>Mức độ {task.title}</label>
                <select id={`priority-${task.id}`} className="select" name={`priority-${task.id}`} autoComplete="off" value={task.priority} onChange={(event) => updateTask(task.id, { priority: event.target.value as Priority })}>
                  {(Object.keys(PRIORITY_LABELS) as Priority[]).map((value) => <option value={value} key={value}>{PRIORITY_LABELS[value]}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor={`category-${task.id}`}>Nhóm {task.title}</label>
                <select id={`category-${task.id}`} className="select" name={`category-${task.id}`} autoComplete="off" value={task.category} onChange={(event) => updateTask(task.id, { category: event.target.value as HabitCategory })}>
                  {(Object.keys(HABIT_CATEGORIES) as HabitCategory[]).map((value) => <option value={value} key={value}>{HABIT_CATEGORIES[value]}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor={`goal-${task.id}`}>Mục tiêu của {task.title}</label>
                <select id={`goal-${task.id}`} className="select" name={`goal-${task.id}`} autoComplete="off" value={task.goalId ?? ""} onChange={(event) => updateTask(task.id, { goalId: event.target.value || undefined })}>
                  <option value="">Không liên kết</option>
                  {goals.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
                </select>
              </div>
              <div className="field task-adjustment-note">
                <label htmlFor={`note-${task.id}`}>Ghi chú</label>
                <textarea id={`note-${task.id}`} name={`note-${task.id}`} autoComplete="off" className="textarea" defaultValue={task.note ?? ""} onBlur={(event) => updateTask(task.id, { note: event.target.value })} placeholder="Đầu ra mong đợi hoặc trở ngại…" />
              </div>
              <div className="field">
                <label htmlFor={`reason-${task.id}`}>Lý do nếu hoãn hoặc bỏ</label>
                <select id={`reason-${task.id}`} name={`reason-${task.id}`} autoComplete="off" className="select" value={reason} onChange={(event) => setReason(event.target.value as (typeof DEFAULT_SKIP_REASONS)[number])}>
                  {DEFAULT_SKIP_REASONS.map((item) => <option value={item} key={item}>{item}</option>)}
                </select>
              </div>
            </div>
          ) : null}
          <div className="task-adjustment-actions">
            {isActionable ? <><button type="button" className="button secondary compact" onClick={() => deferTask(task.id, tomorrowKey(task.date), reason || DEFAULT_DEFER_REASON)}>Hoãn</button><button type="button" className="button ghost compact" onClick={() => skipTask(task.id, reason)}>Bỏ</button></> : null}
            <button type="button" className="button ghost compact" aria-label={`Xóa ${task.title}`} onClick={() => deleteTask(task.id)}><Trash2 size={16} aria-hidden="true" />Xóa</button>
          </div>
        </details>
      </article>
    );
  }

  return (
    <article className="task-row" data-testid="task-row">
      <div className="task-main">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          <span>{PRIORITY_LABELS[task.priority]}</span>
          <span>{HABIT_CATEGORIES[task.category]}</span>
          <span className="num">{task.progress}%</span>
          {goal ? <span>{goal.title}</span> : null}
          {task.status === "deferred" ? <span className="status warning">Đã hoãn đến {task.deferredTo}</span> : null}
          {task.status === "skipped" ? <span className="status bad">Đã bỏ · {task.skipReason}</span> : null}
        </div>
        {isActionable ? (
          <details style={{ marginTop: 8 }}>
            <summary style={{ color: "var(--muted)", cursor: "pointer", fontSize: 12 }}>Ghi chú và điều chỉnh</summary>
            <div className="stack" style={{ marginTop: 10 }}>
              <label className="field-label" htmlFor={`note-${task.id}`}>Ghi chú</label>
              <textarea id={`note-${task.id}`} name={`note-${task.id}`} autoComplete="off" className="textarea" defaultValue={task.note ?? ""} onBlur={(event) => updateTask(task.id, { note: event.target.value })} placeholder="Bối cảnh, đầu ra mong đợi hoặc trở ngại…" />
              <label className="field-label" htmlFor={`reason-${task.id}`}>Lý do khi hoãn hoặc bỏ</label>
              <select id={`reason-${task.id}`} name={`reason-${task.id}`} autoComplete="off" className="select" value={reason} onChange={(event) => setReason(event.target.value as (typeof DEFAULT_SKIP_REASONS)[number])}>
                {DEFAULT_SKIP_REASONS.map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
            </div>
          </details>
        ) : null}
      </div>
      <div className="task-actions">
        {isActionable ? (
          <>
            {progressControl}
            <select className="select" name={`priority-${task.id}`} autoComplete="off" aria-label={`Mức độ ${task.title}`} value={task.priority} onChange={(event) => updateTask(task.id, { priority: event.target.value as Priority })}>
              {(Object.keys(PRIORITY_LABELS) as Priority[]).map((value) => <option value={value} key={value}>{PRIORITY_LABELS[value]}</option>)}
            </select>
            {topPriorityControl}
            <button type="button" className="button secondary compact" onClick={() => deferTask(task.id, tomorrowKey(task.date), reason || DEFAULT_DEFER_REASON)}>Hoãn</button>
            <button type="button" className="button ghost compact" onClick={() => skipTask(task.id, reason)}>Bỏ</button>
          </>
        ) : null}
        <button type="button" className="button ghost compact icon-button" aria-label={`Xóa ${task.title}`} onClick={() => deleteTask(task.id)}><Trash2 size={16} aria-hidden="true" /></button>
      </div>
    </article>
  );
}
