import { useRef, useState } from 'react';
import { HealthScoreHistoryPoint } from '../../../types/domain';

interface HealthScoreTrendChartProps {
  points: HealthScoreHistoryPoint[];
}

const WIDTH = 320;
const HEIGHT = 140;
const PADDING = 16;

function buildSmoothPath(coords: { x: number; y: number }[]) {
  if (coords.length < 2) return '';
  let path = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i - 1] ?? coords[i];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export default function HealthScoreTrendChart({ points }: HealthScoreTrendChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (points.length === 0) return null;

  const scores = points.map((p) => p.score);
  const min = Math.min(...scores) - 5;
  const max = Math.max(...scores) + 5;
  const range = max - min || 1;
  const stepX = (WIDTH - PADDING * 2) / (points.length - 1 || 1);

  const coords = points.map((p, i) => ({
    x: PADDING + i * stepX,
    y: PADDING + (1 - (p.score - min) / range) * (HEIGHT - PADDING * 2),
  }));

  const linePath = buildSmoothPath(coords);
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${HEIGHT - PADDING} L ${coords[0].x} ${HEIGHT - PADDING} Z`;

  const handleMove = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relativeX = ((clientX - rect.left) / rect.width) * WIDTH;
    let closest = 0;
    let closestDist = Infinity;
    coords.forEach((c, i) => {
      const dist = Math.abs(c.x - relativeX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  };

  const active = activeIndex !== null ? points[activeIndex] : null;
  const activeCoord = activeIndex !== null ? coords[activeIndex] : null;
  const labelStride = Math.max(1, Math.ceil(points.length / 6));

  return (
    <div className="relative" data-testid="health-score-trend-chart">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none"
        onPointerMove={(e) => handleMove(e.clientX)}
        onPointerDown={(e) => handleMove(e.clientX)}
        onPointerLeave={() => setActiveIndex(null)}
        data-testid="health-score-trend-svg"
      >
        <defs>
          <linearGradient id="healthScoreLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5445cf" />
            <stop offset="100%" stopColor="#28d9f3" />
          </linearGradient>
          <linearGradient id="healthScoreFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5445cf" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#28d9f3" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#healthScoreFill)" stroke="none" />
        <path d={linePath} fill="none" stroke="url(#healthScoreLine)" strokeWidth={3} strokeLinecap="round" />
        {activeCoord && (
          <>
            <line
              x1={activeCoord.x}
              y1={PADDING}
              x2={activeCoord.x}
              y2={HEIGHT - PADDING}
              stroke="#5445cf"
              strokeOpacity={0.25}
              strokeDasharray="3 3"
            />
            <circle cx={activeCoord.x} cy={activeCoord.y} r={5} fill="#5445cf" stroke="white" strokeWidth={2} />
          </>
        )}
      </svg>
      {active && activeCoord && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl bg-inverse-surface px-3 py-1.5 text-center shadow-lg"
          style={{ left: `${(activeCoord.x / WIDTH) * 100}%`, top: `${(activeCoord.y / HEIGHT) * 100}%` }}
          data-testid="health-score-trend-tooltip"
        >
          <p className="font-label-bold text-[9px] uppercase text-inverse-on-surface/70">{active.label}</p>
          <p className="font-headline-md text-sm text-inverse-on-surface">{active.score}</p>
        </div>
      )}
      <div className="mt-2 flex justify-between font-label-bold text-[10px] text-outline">
        {points.map((p, i) =>
          i % labelStride === 0 || i === points.length - 1 ? <span key={p.date}>{p.label}</span> : null
        )}
      </div>
    </div>
  );
}
