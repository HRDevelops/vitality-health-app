import { ReactNode } from 'react';
import ProgressRing from '../../../components/ui/ProgressRing';

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  subtext?: string;
  gradient: string;
  percent?: number;
  ringColor?: string;
  icon?: ReactNode;
  onClick?: () => void;
  testId: string;
}

export default function MetricCard({ label, value, unit, subtext, gradient, percent, ringColor, icon, onClick, testId }: MetricCardProps) {
  const Component: any = onClick ? 'button' : 'div';
  return (
    <Component
      onClick={onClick}
      data-testid={testId}
      className={`relative flex aspect-square flex-col justify-between overflow-hidden rounded-[24px] p-4 text-left text-white shadow-soft transition-transform duration-200 active:scale-95 ${gradient}`}
    >
      <h3 className="z-10 font-label-bold text-label-bold uppercase tracking-wider opacity-90">{label}</h3>
      <div className="z-10 my-2 flex flex-1 items-center justify-center">
        {percent !== undefined ? (
          <ProgressRing percent={percent} size={64} strokeWidth={5} progressColor={ringColor ?? '#ffffff'}>
            {icon}
          </ProgressRing>
        ) : (
          icon
        )}
      </div>
      <div className="z-10">
        <div className="font-metric-display text-metric-display">
          {value} {unit && <span className="font-body-sm text-body-sm opacity-80">{unit}</span>}
        </div>
        {subtext && <div className="font-label-bold text-[10px] opacity-70">{subtext}</div>}
      </div>
    </Component>
  );
}
