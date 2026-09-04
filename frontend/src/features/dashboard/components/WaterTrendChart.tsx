interface WaterTrendChartProps {
  points: { label: string; waterMl: number }[];
  goalMl: number;
}

const WIDTH = 320;
const HEIGHT = 110;
const PADDING_TOP = 6;
const PADDING_BOTTOM = 6;

export default function WaterTrendChart({ points, goalMl }: WaterTrendChartProps) {
  if (points.length === 0) return null;

  const max = Math.max(goalMl, ...points.map((p) => p.waterMl), 1) * 1.15;
  const chartHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const colWidth = WIDTH / points.length;
  const barWidth = Math.max(6, Math.min(28, colWidth * 0.5));
  const goalY = PADDING_TOP + chartHeight - (goalMl / max) * chartHeight;

  return (
    <div data-testid="log-water-trend-chart">
      <div className="mb-1 flex items-center justify-between">
        <p className="font-label-bold text-[10px] uppercase text-on-surface-variant">Last 7 days</p>
        <p className="font-label-bold text-[10px] uppercase text-primary">- - - Goal</p>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" data-testid="log-water-trend-svg">
        <line x1={0} y1={goalY} x2={WIDTH} y2={goalY} stroke="#5445cf" strokeOpacity={0.4} strokeDasharray="4 4" strokeWidth={1.5} />
        {points.map((p, i) => {
          const barHeight = Math.max(4, (p.waterMl / max) * chartHeight);
          const x = i * colWidth + (colWidth - barWidth) / 2;
          const y = PADDING_TOP + (chartHeight - barHeight);
          const met = p.waterMl >= goalMl;
          return (
            <rect
              key={p.label + i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={barWidth / 2}
              fill={met ? '#5445cf' : 'rgba(84,69,207,0.3)'}
              data-testid={`log-water-trend-bar-${p.label}`}
            />
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between px-1">
        {points.map((p, i) => (
          <span key={p.label + i} className="flex-1 text-center font-label-bold text-[9px] text-on-surface-variant">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
