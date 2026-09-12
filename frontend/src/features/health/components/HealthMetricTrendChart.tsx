import React, { useState, useMemo } from 'react';
import { Activity, Droplets, TrendingUp, Info } from 'lucide-react';
import { HealthMetric, HealthMetricType } from '../../../types/domain';

interface HealthMetricTrendChartProps {
  metrics: HealthMetric[];
}

export default function HealthMetricTrendChart({ metrics }: HealthMetricTrendChartProps) {
  const [activeTab, setActiveTab] = useState<HealthMetricType>('blood_pressure');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  // Filter and sort chronologically (oldest to newest)
  const bpReadings = useMemo(() => {
    return metrics
      .filter((m) => m.type === 'blood_pressure' && m.systolic && m.diastolic)
      .slice(-10)
      .reverse();
  }, [metrics]);

  const glucoseReadings = useMemo(() => {
    return metrics
      .filter((m) => m.type === 'blood_glucose' && m.glucoseValue)
      .slice(-10)
      .reverse();
  }, [metrics]);

  // SVG viewport setup
  const svgWidth = 350;
  const svgHeight = 175;
  const padLeft = 32;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 28;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  // Scale helpers for BP
  const bpYRange = { min: 60, max: 190 };
  const getBpY = (val: number) => {
    const clamped = Math.max(bpYRange.min, Math.min(bpYRange.max, val));
    return padTop + plotHeight - ((clamped - bpYRange.min) / (bpYRange.max - bpYRange.min)) * plotHeight;
  };

  // Scale helpers for Glucose
  const glucoseYRange = { min: 50, max: 240 };
  const getGlucoseY = (val: number) => {
    const clamped = Math.max(glucoseYRange.min, Math.min(glucoseYRange.max, val));
    return padTop + plotHeight - ((clamped - glucoseYRange.min) / (glucoseYRange.max - glucoseYRange.min)) * plotHeight;
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return padLeft + plotWidth / 2;
    return padLeft + (index / (total - 1)) * plotWidth;
  };

  return (
    <div
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all"
      data-testid="health-metric-trend-chart"
    >
      {/* Header & Metric Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Clinical Trend Trajectory
            </h3>
            <span className="text-[10px] text-slate-400">Recent reading history</span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('blood_pressure');
              setSelectedPointIndex(null);
            }}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
              activeTab === 'blood_pressure'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            data-testid="chart-tab-bp"
          >
            <Activity size={13} />
            <span>BP</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('blood_glucose');
              setSelectedPointIndex(null);
            }}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
              activeTab === 'blood_glucose'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            data-testid="chart-tab-glucose"
          >
            <Droplets size={13} />
            <span>Glucose</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-4">
        {activeTab === 'blood_pressure' ? (
          <div>
            {/* Chart Legend */}
            <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Systolic
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-secondary" />
                  Diastolic
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-0.5 w-3 border-t border-dashed border-fern" />
                  120 Normal
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-0.5 w-3 border-t border-dashed border-saffron" />
                  140 Stage 2
                </span>
              </div>
            </div>

            {bpReadings.length === 0 ? (
              <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-400">
                No blood pressure readings to display yet.
              </div>
            ) : (
              <div className="relative">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full overflow-visible">
                  {/* Grid Lines & Labels */}
                  {[80, 120, 140, 180].map((val) => {
                    const y = getBpY(val);
                    return (
                      <g key={val}>
                        <line
                          x1={padLeft}
                          y1={y}
                          x2={svgWidth - padRight}
                          y2={y}
                          stroke={val === 120 ? '#1E5E4D' : val === 140 ? '#E29528' : '#e2e8f0'}
                          strokeDasharray={val === 120 || val === 140 ? '3 3' : undefined}
                          strokeWidth={val === 120 || val === 140 ? 1 : 0.8}
                          opacity={val === 120 || val === 140 ? 0.6 : 0.4}
                        />
                        <text
                          x={padLeft - 6}
                          y={y + 3}
                          fontSize="9"
                          fill="#94a3b8"
                          textAnchor="end"
                          className="font-mono tabular-nums"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Systolic Line & Area */}
                  {bpReadings.length > 1 && (
                    <>
                      <path
                        d={`M ${bpReadings
                          .map((r, i) => `${getX(i, bpReadings.length)},${getBpY(r.systolic!)}`)
                          .join(' L ')}`}
                        fill="none"
                        stroke="#5445cf"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Diastolic Line */}
                      <path
                        d={`M ${bpReadings
                          .map((r, i) => `${getX(i, bpReadings.length)},${getBpY(r.diastolic!)}`)
                          .join(' L ')}`}
                        fill="none"
                        stroke="#006876"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}

                  {/* Data Points */}
                  {bpReadings.map((r, i) => {
                    const x = getX(i, bpReadings.length);
                    const ySys = getBpY(r.systolic!);
                    const yDia = getBpY(r.diastolic!);
                    const isSelected = selectedPointIndex === i;
                    const dateLabel = new Date(r.loggedAt).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                    });

                    return (
                      <g key={r.id || i} className="cursor-pointer" onClick={() => setSelectedPointIndex(i)}>
                        {/* Connecting vertical line between systolic and diastolic */}
                        <line x1={x} y1={ySys} x2={x} y2={yDia} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />

                        {/* Systolic Dot */}
                        <circle
                          cx={x}
                          cy={ySys}
                          r={isSelected ? 5.5 : 4}
                          fill="#5445cf"
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="transition-all"
                        />

                        {/* Diastolic Dot */}
                        <circle
                          cx={x}
                          cy={yDia}
                          r={isSelected ? 5.5 : 4}
                          fill="#006876"
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="transition-all"
                        />

                        {/* X-axis Date */}
                        <text
                          x={x}
                          y={svgHeight - 6}
                          fontSize="9"
                          fill={isSelected ? '#1c1a27' : '#94a3b8'}
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          textAnchor="middle"
                          className="font-mono"
                        >
                          {dateLabel}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Selected Point Popover */}
                {selectedPointIndex !== null && bpReadings[selectedPointIndex] && (
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">
                        {new Date(bpReadings[selectedPointIndex].loggedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="ml-2 font-mono font-black tabular-nums text-primary">
                        {bpReadings[selectedPointIndex].systolic}/{bpReadings[selectedPointIndex].diastolic} mmHg
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        bpReadings[selectedPointIndex].uiToken === 'Clay'
                          ? 'bg-clay/15 text-clay'
                          : bpReadings[selectedPointIndex].uiToken === 'Saffron'
                          ? 'bg-saffron/15 text-saffron'
                          : 'bg-fern/15 text-fern'
                      }`}
                    >
                      {bpReadings[selectedPointIndex].category}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Glucose Legend */}
            <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Glucose (mg/dL)
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  Filled: Fasting | Hollow: Random
                </span>
              </div>
              <span className="rounded bg-fern/10 px-1.5 py-0.5 text-[10px] font-bold text-fern">
                Target Zone: 70–99
              </span>
            </div>

            {glucoseReadings.length === 0 ? (
              <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-400">
                No blood glucose readings to display yet.
              </div>
            ) : (
              <div className="relative">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full overflow-visible">
                  {/* Shaded Fasting Target Zone Band (70 - 99 mg/dL) */}
                  <rect
                    x={padLeft}
                    y={getGlucoseY(99)}
                    width={plotWidth}
                    height={Math.max(4, getGlucoseY(70) - getGlucoseY(99))}
                    fill="#1E5E4D"
                    fillOpacity="0.08"
                    rx="4"
                  />

                  {/* Grid Lines & Labels */}
                  {[70, 100, 140, 200].map((val) => {
                    const y = getGlucoseY(val);
                    return (
                      <g key={val}>
                        <line
                          x1={padLeft}
                          y1={y}
                          x2={svgWidth - padRight}
                          y2={y}
                          stroke={val === 70 || val === 100 ? '#1E5E4D' : '#e2e8f0'}
                          strokeDasharray={val === 70 || val === 100 ? '3 3' : undefined}
                          strokeWidth={val === 70 || val === 100 ? 1 : 0.8}
                          opacity={val === 70 || val === 100 ? 0.6 : 0.4}
                        />
                        <text
                          x={padLeft - 6}
                          y={y + 3}
                          fontSize="9"
                          fill="#94a3b8"
                          textAnchor="end"
                          className="font-mono tabular-nums"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Glucose Trend Line */}
                  {glucoseReadings.length > 1 && (
                    <path
                      d={`M ${glucoseReadings
                        .map((r, i) => `${getX(i, glucoseReadings.length)},${getGlucoseY(r.glucoseValue!)}`)
                        .join(' L ')}`}
                      fill="none"
                      stroke="#5445cf"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Data Points */}
                  {glucoseReadings.map((r, i) => {
                    const x = getX(i, glucoseReadings.length);
                    const y = getGlucoseY(r.glucoseValue!);
                    const isSelected = selectedPointIndex === i;
                    const dateLabel = new Date(r.loggedAt).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                    });

                    return (
                      <g key={r.id || i} className="cursor-pointer" onClick={() => setSelectedPointIndex(i)}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 6 : 4.5}
                          fill={r.isFasting ? '#5445cf' : '#ffffff'}
                          stroke="#5445cf"
                          strokeWidth="2"
                          className="transition-all"
                        />
                        <text
                          x={x}
                          y={svgHeight - 6}
                          fontSize="9"
                          fill={isSelected ? '#1c1a27' : '#94a3b8'}
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          textAnchor="middle"
                          className="font-mono"
                        >
                          {dateLabel}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Selected Point Popover */}
                {selectedPointIndex !== null && glucoseReadings[selectedPointIndex] && (
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">
                        {new Date(glucoseReadings[selectedPointIndex].loggedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="ml-2 font-mono font-black tabular-nums text-primary">
                        {glucoseReadings[selectedPointIndex].glucoseValue} mg/dL
                      </span>
                      <span className="ml-1 text-[10px] text-slate-400">
                        ({glucoseReadings[selectedPointIndex].isFasting ? 'Fasting' : 'Post-Meal'})
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        glucoseReadings[selectedPointIndex].uiToken === 'Clay'
                          ? 'bg-clay/15 text-clay'
                          : glucoseReadings[selectedPointIndex].uiToken === 'Saffron'
                          ? 'bg-saffron/15 text-saffron'
                          : 'bg-fern/15 text-fern'
                      }`}
                    >
                      {glucoseReadings[selectedPointIndex].category}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
