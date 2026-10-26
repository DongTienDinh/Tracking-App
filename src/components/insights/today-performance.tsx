import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type { DailyInsight } from "@/domain/insights";

interface TodayPerformanceProps {
  data: DailyInsight[];
  percent: number;
  earned: number;
  planned: number;
}

export function TodayPerformance({ data, percent, earned, planned }: TodayPerformanceProps) {
  const boundedPercent = Math.max(0, Math.min(100, Math.round(percent)));
  const circumference = 2 * Math.PI * 48;
  const maxPoints = Math.max(1, ...data.flatMap((item) => [item.planned, Math.max(0, item.earned)]));

  return (
    <div className="performance-visual">
      <div className="performance-dial">
        <svg viewBox="0 0 120 120" role="img" aria-label={`Hiệu suất hôm nay ${boundedPercent}%`}>
          <circle className="performance-dial-track" cx="60" cy="60" r="48" />
          <circle
            className="performance-dial-value"
            cx="60"
            cy="60"
            r="48"
            strokeDasharray={`${(boundedPercent / 100) * circumference} ${circumference}`}
          />
        </svg>
        <div className="performance-dial-copy">
          <strong className="num">{boundedPercent}%</strong>
          <span>{planned > 0 ? `${earned}/${planned} điểm` : "Chưa có kế hoạch"}</span>
        </div>
      </div>

      <figure className="today-chart">
        <div className="chart-legend" aria-hidden="true">
          <span><i className="legend-mark earned" />Đạt được</span>
          <span><i className="legend-mark planned" />Kế hoạch</span>
        </div>
        <svg className="chart" viewBox="0 0 620 210" role="img" aria-labelledby="today-trend-title today-trend-desc">
          <title id="today-trend-title">Điểm đạt được trong bảy ngày gần nhất</title>
          <desc id="today-trend-desc">{data.map((item) => `${item.date}: ${item.earned}/${item.planned} điểm`).join("; ")}</desc>
          {[44, 104, 164].map((y) => <line key={y} x1="46" y1={y} x2="606" y2={y} className="chart-grid" />)}
          <text x="36" y="48" textAnchor="end">{maxPoints}</text>
          <text x="36" y="108" textAnchor="end">{Number.isInteger(maxPoints / 2) ? maxPoints / 2 : (maxPoints / 2).toFixed(1)}</text>
          <text x="36" y="168" textAnchor="end">0</text>
          {data.map((item, index) => {
            const x = 62 + index * 76;
            const plannedHeight = (item.planned / maxPoints) * 120;
            const earnedHeight = (Math.max(0, item.earned) / maxPoints) * 120;
            return (
              <g key={item.date}>
                <rect x={x} y={164 - plannedHeight} width="38" height={plannedHeight} className="chart-plan" />
                <rect x={x} y={164 - earnedHeight} width="38" height={earnedHeight} className="chart-accent" />
                <text x={x + 19} y="190" textAnchor="middle">{format(parseISO(item.date), "EEE", { locale: vi })}</text>
              </g>
            );
          })}
        </svg>
      </figure>
    </div>
  );
}
