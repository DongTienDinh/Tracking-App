"use client";

import { useDeferredValue, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DailyNoteEditor } from "@/components/notes/daily-note-editor";
import { fromDateKey, toDateKey } from "@/lib/dates";
import { useAppStore } from "@/store/app-store";

export function NotesScreen() {
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const notes = useAppStore((state) => state.notes).filter((note) => note.profileId === activeProfileId).toSorted((a, b) => b.date.localeCompare(a.date));
  const saveNote = useAppStore((state) => state.saveNote);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase("vi"));
  const [selectedDate, setSelectedDate] = useState(notes[0]?.date ?? toDateKey(new Date()));
  const filtered = deferredQuery ? notes.filter((note) => note.content.toLocaleLowerCase("vi").includes(deferredQuery) || note.date.includes(deferredQuery)) : notes;
  const selected = notes.find((note) => note.date === selectedDate);
  return (
    <div className="page stack">
      <PageHeader title="Ghi chú" subtitle="Mỗi ngày một ghi chú tự do, có thể tìm lại theo nội dung hoặc ngày." />
      <div className="notes-layout">
        <aside className="panel notes-list">
          <label className="search-field" htmlFor="notes-search"><Search size={16} aria-hidden="true" /><span className="sr-only">Tìm ghi chú</span><input id="notes-search" name="notesSearch" autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm trong ghi chú…" /></label>
          <div className="field"><label htmlFor="note-date">Mở ngày</label><input id="note-date" name="noteDate" autoComplete="off" className="input" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></div>
          <div className="note-results">{filtered.map((note) => <button className={note.date === selectedDate ? "active" : ""} type="button" key={note.id} onClick={() => setSelectedDate(note.date)}><strong>{format(fromDateKey(note.date), "EEEE, d/M/yyyy", { locale: vi })}</strong><span>{note.content || "Ghi chú trống"}</span></button>)}{filtered.length === 0 ? <div className="empty-state">Không tìm thấy ghi chú phù hợp.</div> : null}</div>
        </aside>
        <section className="panel note-editor" aria-labelledby="note-editor-title">
          <div className="panel-title-row"><h2 className="panel-title" id="note-editor-title">{format(fromDateKey(selectedDate), "EEEE, d 'tháng' M, yyyy", { locale: vi })}</h2><span className="panel-note">{selected ? `Cập nhật ${format(new Date(selected.updatedAt), "HH:mm d/M")}` : "Ghi chú mới"}</span></div>
          <DailyNoteEditor key={selected?.id ?? selectedDate} initialContent={selected?.content ?? ""} onSave={(content) => saveNote(selectedDate, content)} />
          <div className="note-prompts"><p>Hôm nay điều gì diễn ra tốt?</p><p>Điều gì cản trở bạn?</p><p>Ngày mai bạn sẽ thay đổi điều gì?</p></div>
        </section>
      </div>
    </div>
  );
}
