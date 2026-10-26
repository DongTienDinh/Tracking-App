import type { CSSProperties } from "react";
import { eachDayOfInterval, endOfWeek, format, parseISO, startOfWeek } from "date-fns";
import { vi } from "date-fns/locale";
import type { DailyInsight } from "@/domain/insights";
import { toDateKey } from "@/lib/dates";

function activityLevel(value: number) {
  if (value === 0) return 0;
  if (value <= 1) return 1;
  if (value <= 2) return 2;
  if (value <= 4) return 3;
  return 4;
}

export function ActivityHeatmap({ data }: { data: DailyInsight[] }) {
  const firstDate = parseISO(data[0]?.date ?? toDateKey(new Date()));
  const lastDate = parseISO(data.at(-1)?.date ?? toDateKey(new Date()));
  const gridStart = startOfWeek(firstDate, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(lastDate, { weekStartsOn: 1 });
  const dataByDate = new Map(data.map((item) => [item.date, item]));
  const cells = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekCount = cells.length / 7;
  const totalActivity = data.reduce((sum, item) => sum + item.activity, 0);
  const activeDays = data.filter((item) => item.activity > 0).length;
  const monthLabels = cells.reduce<Array<{ key: string; label: string; week: number }>>((labels, date, index) => {
    const key = format(date, "yyyy-MM");
    if (!labels.some((item) => item.key === key) && date >= firstDate && date <= lastDate) {
      const nextLabel = { key, label: format(date, "MMM", { locale: vi }), week: Math.floor(index / 7) + 1 };
      if (labels.at(-1)?.week === nextLabel.week) labels[labels.length - 1] = nextLabel;
      else labels.push(nextLabel);
    }
    return labels;
  }, []);
  const gridStyle = { "--heat-weeks": weekCount } as CSSProperties;

  return (
    <section className="activity-year-panel" aria-labelledby="activity-year-title">
      <div className="activity-year-heading">
        <div>
          <h2 id="activity-year-title">Nhịp hoạt động 12 tháng</h2>
          <p><strong className="num">{totalActivity}</strong> hoạt động trong {activeDays} ngày có nhịp</p>
        </div>
        <span>{format(firstDate, "d/M/yyyy")} – {format(lastDate, "d/M/yyyy")}</span>
      </div>

      <div className="activity-scroll" tabIndex={0} aria-label="Cuộn ngang để xem đủ lịch hoạt động">
        <div className="activity-calendar" style={gridStyle}>
          <div className="activity-months" aria-hidden="true">
            {monthLabels.map((month) => <span style={{ gridColumnStart: month.week }} key={month.key}>{month.label}</span>)}
          </div>
          <div className="activity-calendar-body">
            <div className="activity-weekdays" aria-hidden="true"><span>T2</span><span /><span>T4</span><span /><span>T6</span><span /><span>CN</span></div>
            <div
              className="activity-grid-year"
              role="img"
              aria-label={`${totalActivity} hoạt động trong 12 tháng qua, trên ${activeDays} ngày`}
            >
              {cells.map((date) => {
                const key = toDateKey(date);
                const item = dataByDate.get(key);
                const inRange = date >= firstDate && date <= lastDate;
                const value = inRange ? item?.activity ?? 0 : 0;
                return (
                  <span
                    className={`activity-cell${inRange ? "" : " outside"}`}
                    data-level={activityLevel(value)}
                    title={inRange ? `${format(date, "d MMMM yyyy", { locale: vi })}: ${value} hoạt động` : undefined}
                    key={key}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="activity-legend" aria-label="Chú thích cường độ hoạt động">
        <span>Ít</span>{[0, 1, 2, 3, 4].map((level) => <i className="activity-cell" data-level={level} key={level} />)}<span>Nhiều</span>
      </div>
    </section>
  );
}
