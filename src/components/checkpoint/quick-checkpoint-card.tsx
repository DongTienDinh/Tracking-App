"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Circle, Clock3 } from "lucide-react";
import type { DailyTask, MiddayCheckpoint } from "@/domain/types";
import { buildCheckpointSummary } from "@/domain/checkpoint";
import { useAppStore } from "@/store/app-store";

export function QuickCheckpointCard({
  date,
  tasks,
  checkpoint,
  checkpointTime,
  setupHref,
}: {
  date: string;
  tasks: DailyTask[];
  checkpoint?: MiddayCheckpoint;
  checkpointTime: string;
  setupHref: string;
}) {
  const [now, setNow] = useState(() => new Date());
  const setTaskProgress = useAppStore((state) => state.setTaskProgress);
  const saveCheckpoint = useAppStore((state) => state.saveCheckpoint);
  const actionableTasks = useMemo(
    () => [...tasks.filter((task) => !["deferred", "skipped"].includes(task.status))]
      .sort((a, b) => Number(b.isTopPriority) - Number(a.isTopPriority) || a.createdAt.localeCompare(b.createdAt)),
    [tasks],
  );
  const summary = useMemo(
    () => buildCheckpointSummary(tasks, now, checkpointTime, Boolean(checkpoint)),
    [tasks, now, checkpointTime, checkpoint],
  );
  const needsAttention = summary.attention === "due-empty" || summary.attention === "due-progress";

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  function submitCheckpoint() {
    if (summary.completed === 0) return;
    const unfinished = actionableTasks.filter((task) => task.progress < 100);
    saveCheckpoint(
      date,
      "medium",
      unfinished[0]?.id,
      `Checkpoint ${checkpointTime}: ${summary.completed}/${summary.total} việc hoàn thành`,
      unfinished.slice(0, 3).map((task) => ({ taskId: task.id, action: "keep" as const })),
    );
  }

  return (
    <section className={`quick-checkpoint${checkpoint && summary.completed > 0 ? " complete" : ""}${needsAttention ? " due" : ""}`} aria-labelledby="quick-checkpoint-title">
      <div className="quick-checkpoint-heading">
        {checkpoint && summary.completed > 0 ? <Check size={22} aria-hidden="true" /> : summary.isDue ? <Clock3 size={22} aria-hidden="true" /> : <Circle size={22} aria-hidden="true" />}
        <div>
          <h2 id="quick-checkpoint-title">Checkpoint {checkpointTime}</h2>
          <p>{summary.total > 0 ? `${summary.completed}/${summary.total} việc đã hoàn thành` : "Điểm dừng bắt buộc giữa ngày"}</p>
        </div>
      </div>

      {actionableTasks.length ? (
        <fieldset className="quick-checkpoint-list">
          <legend className="sr-only">Công việc hoàn thành trước checkpoint</legend>
          {actionableTasks.map((task) => (
            <label className={task.progress === 100 ? "checked" : ""} key={task.id}>
              <input
                className="checkbox"
                type="checkbox"
                checked={task.progress === 100}
                onChange={() => setTaskProgress(task.id, task.progress === 100 ? 0 : 100)}
              />
              <span>{task.title}</span>
              {task.progress > 0 && task.progress < 100 ? <small className="num">{task.progress}%</small> : null}
            </label>
          ))}
        </fieldset>
      ) : null}

      <p className={`checkpoint-message${needsAttention ? " attention" : ""}`} aria-live="polite">{summary.message}</p>

      {actionableTasks.length ? (
        <div className="quick-checkpoint-actions">
          <button className="button" type="button" disabled={summary.completed === 0} onClick={submitCheckpoint}>{checkpoint ? "Cập nhật checkpoint" : "Xác nhận checkpoint"}</button>
          <Link className="text-action" href={`${setupHref.replace("#day-setup", "")}#checkpoint`}>Điều chỉnh chi tiết trong lịch</Link>
        </div>
      ) : <Link className="button" href={setupHref}>Thiết lập công việc hôm nay</Link>}
    </section>
  );
}
