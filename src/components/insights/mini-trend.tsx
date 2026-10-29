import type { DailyInsight } from "@/domain/insights";

export function MiniTrend({ data }: { data: DailyInsight[] }) {
  return (
    <figure style={{ margin: 0 }}>
      <svg className="chart" viewBox="0 0 420 120" role="img" aria-labelledby="mini-trend-title mini-trend-desc">
        <title id="mini-trend-title">Tỷ lệ hoàn thành bảy ngày</title>
        <desc id="mini-trend-desc">{data.map((item) => `${item.date}: ${Math.round(item.percent)}%`).join("; ")}</desc>
        <line x1="20" y1="92" x2="405" y2="92" className="chart-grid" />
        {data.map((item, index) => {
          const width = 34; const x = 28 + index * 54; const height = Math.max(0, (item.percent / 100) * 72);
          return <g key={item.date}><rect x={x} y={92 - height} width={width} height={height} rx="3" className="chart-accent" /><text x={x + width / 2} y="111" textAnchor="middle">{item.date.slice(8)}</text></g>;
        })}
      </svg>
    </figure>
  );
}
