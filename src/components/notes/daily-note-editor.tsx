"use client";

import { useState } from "react";

export function DailyNoteEditor({ initialContent, onSave }: { initialContent: string; onSave: (content: string) => void }) {
  const [content, setContent] = useState(initialContent);
  return (
    <div className="field">
      <label htmlFor="daily-note">Ghi chú nhanh</label>
      <textarea id="daily-note" name="dailyNote" autoComplete="off" className="textarea" value={content} onChange={(event) => setContent(event.target.value)} onBlur={() => onSave(content)} placeholder="Điều gì đang diễn ra tốt? Điều gì cản trở bạn?" />
      <span className="panel-note">Tự động lưu khi rời ô nhập.</span>
    </div>
  );
}
