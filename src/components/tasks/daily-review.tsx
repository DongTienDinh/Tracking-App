"use client";

import { useState, type FormEvent } from "react";
import type { DailyReview } from "@/domain/types";

export function DailyReviewPanel({ existing, onComplete }: { existing?: DailyReview; onComplete: (note?: string) => void }) {
  const [note, setNote] = useState(existing?.note ?? "");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onComplete(note || undefined); }
  return (
    <form className="stack" onSubmit={submit}>
      <div className="field"><label htmlFor="review-note">Tổng kết cuối ngày</label><textarea id="review-note" name="dailyReview" autoComplete="off" className="textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Điều gì hiệu quả, điều gì cần đổi vào ngày mai?" /></div>
      <button type="submit" className="button secondary">{existing ? "Cập nhật tổng kết" : "Hoàn thành tổng kết"}</button>
    </form>
  );
}
