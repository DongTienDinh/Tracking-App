"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { goalProgress } from "@/domain/goals";
import { buildDailyInsights, taskOutcomeCounts, type DailyInsight } from "@/domain/insights";
import { habitStreak } from "@/domain/streaks";
import { HABIT_CATEGORIES, useAppStore } from "@/store/app-store";

function ScoreChart({ data }: { data: DailyInsight[] }) {
  const max = Math.max(1, ...data.map((item) => Math.max(item.planned, item.earned)));
  const points = data.map((item, index) => {
    const x = 40 + index * (540 / Math.max(1, data.length - 1));
    const y = 155 - (Math.max(0, item.earned) / max) * 125;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return <figure style={{ margin: 0 }}><svg className="chart" viewBox="0 0 620 190" role="img" aria-labelledby="score-chart-title score-chart-desc"><title id="score-chart-title">Điểm mỗi ngày trong 30 ngày</title><desc id="score-chart-desc">Điểm thấp nhất {Math.min(...data.map((item) => item.earned))}, cao nhất {Math.max(...data.map((item) => item.earned))}.</desc>{[30, 72, 114, 155].map((y) => <line x1="40" x2="580" y1={y} y2={y} className="chart-grid" key={y} />)}<polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" />{data.filter((_, index) => index % 7 === 0 || index === data.length - 1).map((item) => { const index = data.indexOf(item); return <text x={40 + index * (540 / Math.max(1, data.length - 1))} y="178" textAnchor="middle" key={item.date}>{item.date.slice(5)}</text>; })}</svg><details className="chart-data"><summary>Xem bảng dữ liệu 30 ngày</summary><table><thead><tr><th>Ngày</th><th>Điểm đạt</th><th>Điểm kế hoạch</th></tr></thead><tbody>{data.map((item) => <tr key={item.date}><td>{item.date}</td><td>{item.earned}</td><td>{item.planned}</td></tr>)}</tbody></table></details></figure>;
}

function WeeklyBars({ data }: { data: DailyInsight[] }) {
  const max = Math.max(1, ...data.map((item) => item.percent));
  return <figure style={{ margin: 0 }}><svg className="chart" viewBox="0 0 560 190" role="img" aria-labelledby="weekly-chart-title weekly-chart-desc"><title id="weekly-chart-title">Tỷ lệ hoàn thành bảy ngày</title><desc id="weekly-chart-desc">{data.map((item) => `${item.date}: ${Math.round(item.percent)}%`).join("; ")}</desc><line x1="36" x2="540" y1="150" y2="150" className="chart-grid" />{data.map((item, index) => { const height = (item.percent / Math.max(100, max)) * 120; const x = 48 + index * 70; return <g key={item.date}><rect x={x} y={150 - height} width="38" height={height} rx="3" className="chart-accent" /><text x={x + 19} y={142 - height} textAnchor="middle">{Math.round(item.percent)}%</text><text x={x + 19} y="170" textAnchor="middle">{format(new Date(`${item.date}T12:00:00`), "EEE", { locale: vi })}</text></g>; })}</svg></figure>;
}

function RankedBar({ label, value, max, suffix = "" }: { label: string; value: number; max: number; suffix?: string }) {
  return <div className="rank-row"><div><span>{label}</span><strong className="num">{value}{suffix}</strong></div><div className="rank-track"><span style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} /></div></div>;
}

export function InsightsScreen() {
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const allTasks = useAppStore((state) => state.tasks);
  const allLogs = useAppStore((state) => state.habitLogs);
  const allHabits = useAppStore((state) => state.habits);
  const allGoals = useAppStore((state) => state.goals);
  const allDays = useAppStore((state) => state.days);
  const tasks = useMemo(() => allTasks.filter((task) => task.profileId === activeProfileId), [activeProfileId, allTasks]);
  const logs = useMemo(() => allLogs.filter((log) => log.profileId === activeProfileId), [activeProfileId, allLogs]);
  const habits = useMemo(() => allHabits.filter((habit) => habit.profileId === activeProfileId), [activeProfileId, allHabits]);
  const goals = useMemo(() => allGoals.filter((goal) => goal.profileId === activeProfileId), [activeProfileId, allGoals]);
  const days = useMemo(() => allDays.filter((day) => day.profileId === activeProfileId), [activeProfileId, allDays]);
  const today = useMemo(() => new Date(), []);
  const thirtyDays = useMemo(() => buildDailyInsights(tasks, logs, days, today, 30), [tasks, logs, days, today]);
  const sevenDays = thirtyDays.slice(-7);
  const previousSeven = useMemo(() => buildDailyInsights(tasks, logs, days, subDays(today, 7), 7), [tasks, logs, days, today]);
  const outcomes = taskOutcomeCounts(tasks);
  const categories = Object.fromEntries(Object.keys(HABIT_CATEGORIES).map((key) => [key, tasks.filter((task) => task.category === key).length])) as Record<keyof typeof HABIT_CATEGORIES, number>;
  const maxCategory = Math.max(1, ...Object.values(categories));
  const currentCompleted = sevenDays.reduce((sum, day) => sum + day.completed, 0);
  const currentTotal = sevenDays.reduce((sum, day) => sum + day.total, 0);
  const previousCompleted = previousSeven.reduce((sum, day) => sum + day.completed, 0);
  const currentScore = sevenDays.reduce((sum, day) => sum + day.earned, 0);
  const issueCount = tasks.filter((task) => task.status === "deferred" || task.status === "skipped").length;
  const bestHabit = habits.map((habit) => ({ name: habit.name, streak: habitStreak(habit, logs, days, format(today, "yyyy-MM-dd")) })).toSorted((a, b) => b.streak - a.streak)[0];

  return (
    <div className="page stack">
      <PageHeader title="Thống kê" subtitle="Mọi nhận xét và biểu đồ được tính trực tiếp từ dữ liệu của hồ sơ hiện tại." />
      <section className="panel tonal weekly-report" aria-labelledby="weekly-report-title">
        <div><h2 className="panel-title" id="weekly-report-title">Báo cáo 7 ngày</h2><p className="weekly-finding">{currentCompleted >= previousCompleted ? `Bạn hoàn thành nhiều hơn giai đoạn trước ${currentCompleted - previousCompleted} việc.` : `Bạn hoàn thành ít hơn giai đoạn trước ${previousCompleted - currentCompleted} việc; hãy giảm số việc quan trọng mỗi ngày.`}</p></div>
        <dl><div><dt>Hoàn thành</dt><dd className="num">{currentCompleted}/{currentTotal}</dd></div><div><dt>Điểm</dt><dd className="num">{currentScore}</dd></div><div><dt>Chuỗi nổi bật</dt><dd>{bestHabit ? `${bestHabit.name} · ${bestHabit.streak}` : "—"}</dd></div><div><dt>Cần xem lại</dt><dd className="num">{issueCount} việc hoãn/bỏ</dd></div></dl>
      </section>

      <div className="grid-12">
        <section className="panel span-6"><div className="panel-title-row"><h2 className="panel-title">Tỷ lệ hoàn thành theo tuần</h2><span className="panel-note">7 ngày gần nhất</span></div><WeeklyBars data={sevenDays} /></section>
        <section className="panel span-6"><div className="panel-title-row"><h2 className="panel-title">Kế hoạch và thực tế</h2><span className="panel-note">Điểm đạt / điểm kế hoạch</span></div><div className="stack">{sevenDays.map((item) => <div key={item.date}><div className="panel-title-row" style={{ marginBottom: 7 }}><span>{format(new Date(`${item.date}T12:00:00`), "EEE d/M", { locale: vi })}</span><span className="num">{item.earned}/{item.planned}</span></div><ProgressBar value={item.planned ? (Math.max(0, item.earned) / item.planned) * 100 : 0} label={`Thực tế so với kế hoạch ${item.date}`} /></div>)}</div></section>
      </div>

      <section className="panel"><div className="panel-title-row"><h2 className="panel-title">Điểm 30 ngày</h2><span className="panel-note">Một đường, một thang đo</span></div><ScoreChart data={thirtyDays} /></section>

      <div className="grid-12">
        <section className="panel span-4"><div className="panel-title-row"><h2 className="panel-title">Lịch nhiệt hoạt động</h2><span className="panel-note">12 tuần</span></div><div className="heatmap" role="img" aria-label="Mức hoạt động theo ngày trong 12 tuần">{Array.from({ length: 84 }, (_, index) => { const date = subDays(today, 83 - index); const key = format(date, "yyyy-MM-dd"); const day = thirtyDays.find((item) => item.date === key); const activity = day?.activity ?? logs.filter((log) => log.date === key).length; return <span className="heat-cell" data-level={activity === 0 ? 0 : activity <= 2 ? 1 : activity <= 4 ? 2 : 3} title={`${key}: ${activity} hoạt động`} key={key} />; })}</div><p className="panel-note" style={{ marginTop: 14 }}>Ô đậm hơn nghĩa là có nhiều task hoặc habit hoàn thành hơn.</p></section>
        <section className="panel span-4"><div className="panel-title-row"><h2 className="panel-title">Phân bố công việc</h2><span className="panel-note">Theo nhóm</span></div><div className="stack">{Object.entries(categories).map(([key, value]) => <RankedBar label={HABIT_CATEGORIES[key as keyof typeof HABIT_CATEGORIES]} value={value} max={maxCategory} key={key} />)}</div></section>
        <section className="panel span-4"><div className="panel-title-row"><h2 className="panel-title">Kết quả công việc</h2><span className="panel-note">Toàn bộ dữ liệu</span></div><div className="stack"><RankedBar label="Hoàn thành" value={outcomes.completed} max={Math.max(1, ...Object.values(outcomes))} /><RankedBar label="Hoãn" value={outcomes.deferred} max={Math.max(1, ...Object.values(outcomes))} /><RankedBar label="Bỏ" value={outcomes.skipped} max={Math.max(1, ...Object.values(outcomes))} /></div></section>
      </div>

      <div className="grid-12">
        <section className="panel span-6"><div className="panel-title-row"><h2 className="panel-title">Tiến độ mục tiêu</h2><Link className="panel-note" href="/goals">Quản lý</Link></div><div className="stack">{goals.filter((goal) => goal.status === "active").map((goal) => <div key={goal.id}><div className="panel-title-row" style={{ marginBottom: 7 }}><span>{goal.title}</span><span className="num">{Math.round(goalProgress(goal))}%</span></div><ProgressBar value={goalProgress(goal)} label={`Tiến độ ${goal.title}`} /></div>)}{goals.length === 0 ? <div className="empty-state">Chưa có mục tiêu để hiển thị.</div> : null}</div></section>
        <section className="panel span-6"><div className="panel-title-row"><h2 className="panel-title">Chuỗi thói quen</h2><Link className="panel-note" href="/habits">Quản lý</Link></div><div className="stack">{habits.toSorted((a, b) => habitStreak(b, logs, days, format(today, "yyyy-MM-dd")) - habitStreak(a, logs, days, format(today, "yyyy-MM-dd"))).map((habit) => <RankedBar label={habit.name} value={habitStreak(habit, logs, days, format(today, "yyyy-MM-dd"))} max={Math.max(1, ...habits.map((item) => habitStreak(item, logs, days, format(today, "yyyy-MM-dd"))))} suffix={habit.scheduleType === "weekly_target" ? " tuần" : " ngày"} key={habit.id} />)}{habits.length === 0 ? <div className="empty-state">Chưa có thói quen để tính chuỗi.</div> : null}</div></section>
      </div>
    </div>
  );
}
