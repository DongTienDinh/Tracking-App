"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  addDays, addMonths, addWeeks, eachDayOfInterval, endOfWeek,
  format, isSameMonth, startOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarView } from "@/domain/types";
import { DaySetupWorkspace } from "@/components/calendar/day-setup-workspace";
import { PageHeader } from "@/components/ui/page-header";
import { calculateDailyScore } from "@/domain/scoring";
import { monthGridDates } from "@/domain/calendar";
import { fromDateKey, toDateKey } from "@/lib/dates";
import { isHabitDue } from "@/domain/scheduling";
import { useAppStore } from "@/store/app-store";

const views: { value: CalendarView; label: string }[] = [
  { value: "month", label: "Tháng" }, { value: "week", label: "Tuần" }, { value: "day", label: "Ngày" },
];

function MonthView({ date, onOpenDay }: { date: Date; onOpenDay: (value: string) => void }) {
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const tasks = useAppStore((state) => state.tasks);
  const days = useAppStore((state) => state.days);
  const dates = monthGridDates(date);
  const today = toDateKey(new Date());
  return (
    <section className="panel" aria-label={`Lịch tháng ${format(date, "M/yyyy")}`}>
      <div className="calendar-grid" role="grid">
        {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"].map((label) => <div className="calendar-weekday" role="columnheader" key={label}>{label}</div>)}
        {dates.map((item) => {
          const key = toDateKey(item);
          const dayTasks = tasks.filter((task) => task.profileId === activeProfileId && task.date === key);
          const score = calculateDailyScore(dayTasks, days.find((entry) => entry.profileId === activeProfileId && entry.date === key));
          const state = score.total === 0 ? "empty" : score.percent >= 70 ? "good" : score.percent >= 35 ? "warning" : "bad";
          return (
            <button type="button" role="gridcell" className={`calendar-day${!isSameMonth(item, date) ? " outside" : ""}${key === today ? " today" : ""}`} key={key} onClick={() => onOpenDay(key)} aria-label={`${format(item, "d MMMM", { locale: vi })}, ${score.completed}/${score.total} công việc, ${score.earned} điểm`}>
              <div className="panel-title-row" style={{ marginBottom: 10 }}><span className="num">{format(item, "d")}</span><span className={`status ${state === "empty" ? "" : state}`}>{state === "empty" ? "—" : `${Math.round(score.percent)}%`}</span></div>
              <div className="calendar-detail"><strong className="num">{score.completed}/{score.total}</strong><div className="panel-note num">{score.earned} điểm</div></div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function WeekView({ date, onOpenDay }: { date: Date; onOpenDay: (value: string) => void }) {
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const tasks = useAppStore((state) => state.tasks);
  const habits = useAppStore((state) => state.habits);
  const checkpoints = useAppStore((state) => state.checkpoints);
  const notes = useAppStore((state) => state.notes);
  const dates = eachDayOfInterval({ start: startOfWeek(date, { weekStartsOn: 1 }), end: endOfWeek(date, { weekStartsOn: 1 }) });
  return (
    <section className="week-grid" aria-label="Lịch tuần">
      {dates.map((item) => {
        const key = toDateKey(item);
        const dayTasks = tasks.filter((task) => task.profileId === activeProfileId && task.date === key);
        const top = dayTasks.find((task) => task.isTopPriority) ?? dayTasks[0];
        const dueHabits = habits.filter((habit) => habit.profileId === activeProfileId && isHabitDue(habit, key));
        return (
          <button type="button" className="panel week-day" key={key} onClick={() => onOpenDay(key)}>
            <div className="panel-title-row"><strong>{format(item, "EEE d", { locale: vi })}</strong>{checkpoints.some((entry) => entry.profileId === activeProfileId && entry.date === key) ? <span className="status good">Đã checkpoint</span> : null}</div>
            <div className="task-title">{top?.title ?? "Chưa có việc"}</div>
            <p className="panel-note">{dayTasks.filter((task) => task.status === "completed").length}/{dayTasks.length} việc · {dueHabits.length} thói quen</p>
            {notes.find((note) => note.profileId === activeProfileId && note.date === key)?.content ? <p className="week-note">{notes.find((note) => note.profileId === activeProfileId && note.date === key)?.content}</p> : null}
          </button>
        );
      })}
    </section>
  );
}

function DayView({ date }: { date: Date }) {
  const key = toDateKey(date);
  return <DaySetupWorkspace date={key} />;
}

export function CalendarScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const profile = useAppStore((state) => state.profiles.find((item) => item.id === activeProfileId));
  const setPreferences = useAppStore((state) => state.setCalendarPreferences);
  const rawView = params.get("view");
  const view: CalendarView = rawView === "week" || rawView === "day" || rawView === "month" ? rawView : profile?.preferences.calendarView ?? "month";
  const dateKey = params.get("date") ?? profile?.preferences.calendarDate ?? toDateKey(new Date());
  const date = fromDateKey(dateKey);
  const heading = view === "month" ? format(date, "'Tháng' M, yyyy", { locale: vi }) : view === "week" ? `Tuần ${format(startOfWeek(date, { weekStartsOn: 1 }), "d/M")}–${format(endOfWeek(date, { weekStartsOn: 1 }), "d/M/yyyy")}` : format(date, "EEEE, d 'tháng' M, yyyy", { locale: vi });

  function navigate(nextView: CalendarView, nextDate: Date) {
    const key = toDateKey(nextDate);
    setPreferences(nextView, key);
    router.push(`/calendar?view=${nextView}&date=${key}${nextView === "day" ? "#day-setup" : ""}`);
  }
  function shift(amount: number) {
    const next = view === "month" ? addMonths(date, amount) : view === "week" ? addWeeks(date, amount) : addDays(date, amount);
    navigate(view, next);
  }

  return (
    <div className="page stack">
      <PageHeader title="Lịch" subtitle={heading} actions={<button type="button" className="button secondary" onClick={() => navigate(view, new Date())}>Hôm nay</button>} />
      <div className="calendar-toolbar">
        <div className="segmented" aria-label="Chế độ xem lịch">{views.map((item) => <button type="button" className={view === item.value ? "active" : ""} aria-pressed={view === item.value} key={item.value} onClick={() => navigate(item.value, date)}>{item.label}</button>)}</div>
        <div className="calendar-navigation"><button type="button" className="button secondary icon-button" aria-label="Kỳ trước" onClick={() => shift(-1)}><ChevronLeft size={18} aria-hidden="true" /></button><strong>{heading}</strong><button type="button" className="button secondary icon-button" aria-label="Kỳ sau" onClick={() => shift(1)}><ChevronRight size={18} aria-hidden="true" /></button></div>
      </div>
      {view === "month" ? <MonthView date={date} onOpenDay={(key) => navigate("day", fromDateKey(key))} /> : null}
      {view === "week" ? <WeekView date={date} onOpenDay={(key) => navigate("day", fromDateKey(key))} /> : null}
      {view === "day" ? <DayView date={date} /> : null}
    </div>
  );
}
