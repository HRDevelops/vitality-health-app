import { useState } from 'react';
import { useRef } from 'react';

interface TrendPoint {
  date: string;
  label: string;
  steps: number;
}

interface ActivityTrendChartProps {
  points: TrendPoint[];
}

const WIDTH = 320;
const HEIGHT = 150;
const PADDING_TOP = 10;
const PADDING_BOTTOM = 10;

export default function ActivityTrendChart({ points }: ActivityTrendChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (points.length === 0) {
    return <p className="py-8 text-center font-body-sm text-body-sm text-primary-fixed-dim">No activity data yet.</p>;
  }

  const max = Math.max(...points.map((p) => p.steps), 1);
  const chartHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const colWidth = WIDTH / points.length;
  const barWidth = Math.max(3, Math.min(28, colWidth * 0.5));
  const labelStride = Math.max(1, Math.ceil(points.length / 7));

  return (
    <div className="relative" ref={containerRef} data-testid="activity-trend-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full touch-none" data-testid="activity-trend-svg">
        {points.map((p, i) => {
          const barHeight = Math.max(4, (p.steps / max) * chartHeight);
          const x = i * colWidth + (colWidth - barWidth) / 2;
          const y = PADDING_TOP + (chartHeight - barHeight);
          const isActive = activeIndex === i;
          return (
            <g
              key={`${p.date}-${i}`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              onTouchStart={() => setActiveIndex(i)}
            >
              <rect x={i * colWidth} y={0} width={colWidth} height={HEIGHT} fill="transparent" />
              <rect x={x} y={y} width={barWidth} height={barHeight} rx={barWidth / 2} fill={isActive ? '#ffffff' : 'rgba(255,255,255,0.65)'} />
            </g>
          );
        })}
      </svg>
      {activeIndex !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-white px-2.5 py-1 text-center shadow-md"
          style={{ left: `${((activeIndex + 0.5) / points.length) * 100}%` }}
          data-testid="activity-trend-tooltip"
        >
          <p className="font-label-bold text-[9px] uppercase text-outline">{points[activeIndex].label}</p>
          <p className="font-headline-md text-xs text-on-surface">{points[activeIndex].steps.toLocaleString()}</p>
        </div>
      )}
      <div className="mt-1 flex justify-between px-1 font-label-bold text-[10px] text-primary-fixed-dim">
        {points.map((p, i) => (i % labelStride === 0 || i === points.length - 1 ? <span key={`${p.date}-${i}`}>{p.label}</span> : null))}
      </div>
    </div>
  );
}
