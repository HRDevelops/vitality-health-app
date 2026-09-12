import React from 'react';
import { Activity, Droplets, Heart, Clock, AlertTriangle, CheckCircle2, ShieldAlert, Plus } from 'lucide-react';
import { HealthMetric, HealthMetricType, HealthMetricUiToken } from '../../../types/domain';

interface HealthMetricCardProps {
  type: HealthMetricType;
  metric: HealthMetric | null;
  onLogClick?: () => void;
}

const tokenStyles: Record<HealthMetricUiToken, { badge: string; dot: string; text: string; icon: any }> = {
  Fern: {
    badge: 'bg-fern/15 text-fern border-fern/30',
    dot: 'bg-fern',
    text: 'text-fern',
    icon: CheckCircle2,
  },
  Saffron: {
    badge: 'bg-saffron/15 text-saffron border-saffron/30',
    dot: 'bg-saffron',
    text: 'text-saffron',
    icon: AlertTriangle,
  },
  Clay: {
    badge: 'bg-clay/15 text-clay border-clay/30',
    dot: 'bg-clay',
    text: 'text-clay',
    icon: ShieldAlert,
  },
};

export default function HealthMetricCard({ type, metric, onLogClick }: HealthMetricCardProps) {
  const isBp = type === 'blood_pressure';
  const title = isBp ? 'Blood Pressure' : 'Blood Glucose';
  const Icon = isBp ? Activity : Droplets;

  if (!metric) {
    return (
      <div
        className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
        data-testid={`metric-card-empty-${type}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <span className="text-[11px] text-slate-400">No recent reading</span>
            </div>
          </div>
          {onLogClick && (
            <button
              onClick={onLogClick}
              className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-transform active:scale-95 hover:bg-primary-container"
              data-testid={`log-${type}-button`}
            >
              <Plus size={14} />
              <span>Log</span>
            </button>
          )}
        </div>
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
          <p className="text-xs text-slate-500">
            {isBp
              ? 'Log systolic and diastolic measurements to monitor AHA/ACC zones.'
              : 'Log fasting or post-meal glucose to track ADA glycemic targets.'}
          </p>
        </div>
      </div>
    );
  }

  const tokenConfig = tokenStyles[metric.uiToken] || tokenStyles.Fern;
  const StatusIcon = tokenConfig.icon;
  const formattedDate = new Date(metric.loggedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div
      className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
      data-testid={`metric-card-${type}`}
    >
      {/* Header with Type & Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <span className="text-[11px] text-slate-400">{formattedDate}</span>
          </div>
        </div>

        {/* Semantic Clinical Badge */}
        <div
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${tokenConfig.badge}`}
          data-testid={`status-badge-${type}`}
        >
          <StatusIcon size={12} />
          <span>{metric.category}</span>
        </div>
      </div>

      {/* Metric Main Value */}
      <div className="mt-4 flex items-baseline justify-between">
        {isBp ? (
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-3xl font-black tracking-tight tabular-nums text-slate-900">
                {metric.systolic}
              </span>
              <span className="text-xl font-medium text-slate-300">/</span>
              <span className="font-mono text-3xl font-black tracking-tight tabular-nums text-slate-900">
                {metric.diastolic}
              </span>
              <span className="ml-1 text-xs font-semibold uppercase text-slate-400">mmHg</span>
            </div>
            {typeof metric.pulse === 'number' && metric.pulse > 0 && (
              <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                <Heart size={13} className="text-slate-400" />
                <span className="font-mono font-medium tabular-nums">{metric.pulse}</span>
                <span className="text-[11px] text-slate-400">bpm pulse</span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-black tracking-tight tabular-nums text-slate-900">
                {metric.glucoseValue}
              </span>
              <span className="text-xs font-semibold uppercase text-slate-400">mg/dL</span>
              <span className="ml-1 text-xs text-slate-400 tabular-nums">
                ({(metric.glucoseValue! / 18.0182).toFixed(1)} mmol/L)
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
              <Clock size={13} className="text-slate-400" />
              <span className="font-medium">{metric.isFasting ? 'Fasting (8h+)' : 'Random / Post-Meal'}</span>
            </div>
          </div>
        )}

        {onLogClick && (
          <button
            onClick={onLogClick}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm transition-transform active:scale-95 hover:bg-primary hover:text-white"
            aria-label={`Log new ${title}`}
            data-testid={`quick-log-${type}`}
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Notes if available */}
      {metric.notes && (
        <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-600">
          <span className="italic">"{metric.notes}"</span>
        </div>
      )}
    </div>
  );
}
