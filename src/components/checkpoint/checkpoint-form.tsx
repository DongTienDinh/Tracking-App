"use client";

import { useState, type FormEvent } from "react";
import type { CheckpointPlanChange, DailyTask, EnergyLevel, MiddayCheckpoint } from "@/domain/types";

export function CheckpointForm({ tasks, existing, onSave }: { tasks: DailyTask[]; existing?: MiddayCheckpoint; onSave: (energy: EnergyLevel, nextTaskId?: string, note?: string, planChanges?: CheckpointPlanChange[]) => void }) {
  const openTasks = tasks.filter((task) => !["completed", "deferred", "skipped"].includes(task.status));
  const [energy, setEnergy] = useState<EnergyLevel>(existing?.energy ?? "medium");
  const [keptTaskIds, setKeptTaskIds] = useState<string[]>(existing?.planChanges.filter((change) => change.action === "keep").map((change) => change.taskId) ?? []);
  const [hasCustomizedPlan, setHasCustomizedPlan] = useState(Boolean(existing));
  const [nextTaskId, setNextTaskId] = useState(existing?.nextTaskId ?? openTasks[0]?.id ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const selectedTaskIds = hasCustomizedPlan ? keptTaskIds : openTasks.slice(0, 3).map((task) => task.id);
  const selectedNextTaskId = selectedTaskIds.includes(nextTaskId) ? nextTaskId : selectedTaskIds[0] ?? "";
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const planChanges = selectedTaskIds.map((taskId) => ({ taskId, action: "keep" as const }));
    onSave(energy, selectedNextTaskId || undefined, note || undefined, planChanges);
  }
  function toggleKept(taskId: string) {
    setHasCustomizedPlan(true);
    setKeptTaskIds(() => {
      const current = selectedTaskIds;
      if (current.includes(taskId)) {
        const next = current.filter((id) => id !== taskId);
        if (selectedNextTaskId === taskId) setNextTaskId(next[0] ?? "");
        return next;
      }
      if (current.length >= 3) return current;
      if (!selectedNextTaskId) setNextTaskId(taskId);
      return [...current, taskId];
    });
  }
  return (
    <form className="stack" onSubmit={submit}>
      <div className="form-row">
        <div className="field">
          <label htmlFor="checkpoint-energy">Năng lượng hiện tại</label>
          <select id="checkpoint-energy" name="checkpointEnergy" autoComplete="off" className="select" value={energy} onChange={(event) => setEnergy(event.target.value as EnergyLevel)}>
            <option value="low">Thấp</option><option value="medium">Vừa</option><option value="good">Tốt</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="checkpoint-next">Việc tập trung tiếp theo</label>
          <select id="checkpoint-next" name="checkpointNextTask" autoComplete="off" className="select" value={selectedNextTaskId} onChange={(event) => setNextTaskId(event.target.value)}>
            <option value="">Chưa chọn</option>
            {openTasks.filter((task) => selectedTaskIds.includes(task.id)).map((task) => <option value={task.id} key={task.id}>{task.title}</option>)}
          </select>
        </div>
      </div>
      {openTasks.length ? <fieldset className="weekday-picker"><legend>Giữ lại hôm nay (1–3 việc)</legend>{openTasks.map((task) => <label key={task.id}><input type="checkbox" name="checkpointKeptTasks" value={task.id} checked={selectedTaskIds.includes(task.id)} disabled={!selectedTaskIds.includes(task.id) && selectedTaskIds.length >= 3} onChange={() => toggleKept(task.id)} />{task.title}</label>)}</fieldset> : null}
      <div className="field"><label htmlFor="checkpoint-note">Điều chỉnh kế hoạch</label><textarea id="checkpoint-note" name="checkpointNote" autoComplete="off" className="textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Giữ lại 1–3 việc thực tế, hoãn phần còn lại…" /></div>
      <button className="button" type="submit" disabled={openTasks.length > 0 && selectedTaskIds.length === 0}>{existing ? "Cập nhật checkpoint" : "Lưu checkpoint"}</button>
    </form>
  );
}
