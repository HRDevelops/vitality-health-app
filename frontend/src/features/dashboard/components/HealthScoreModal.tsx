import { useState } from 'react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { useHealthScoreHistory } from '../../../services/api/dashboard';
import HealthScoreTrendChart from './HealthScoreTrendChart';

interface HealthScoreModalProps {
  score: number;
  onClose: () => void;
}

const BREAKDOWN = [
  { label: 'Sleep Quality', value: 88, color: '#5445cf' },
  { label: 'Daily Movement', value: 92, color: '#28d9f3' },
  { label: 'Nutrition Balance', value: 76, color: '#af6100' },
  { label: 'Hydration', value: 80, color: '#006876' },
];

export default function HealthScoreModal({ score, onClose }: HealthScoreModalProps) {
  const [range, setRange] = useState<'week' | 'month'>('week');
  const { data: history, isLoading } = useHealthScoreHistory(range);

  return (
    <BottomSheet
      title="Health Score Breakdown"
      subtitle={`Overall score: ${score}/100`}
      onClose={onClose}
      testId="health-score-modal-overlay"
    >
      <div className="space-y-6" data-testid="health-score-modal">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-headline-md text-sm text-on-surface">Score Progression</h3>
            <div className="flex items-center gap-1 rounded-full bg-surface-container p-1">
              {(['week', 'month'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  data-testid={`health-score-range-${r}`}
                  className={`rounded-full px-3 py-1 font-label-bold text-[10px] uppercase transition-colors ${
                    range === r ? 'bg-primary text-on-primary' : 'text-outline'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {isLoading && <p className="font-body-sm text-body-sm text-on-surface-variant">Loading trend...</p>}
          {history && <HealthScoreTrendChart points={history.points} />}
          {history && (
            <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant" data-testid="health-score-trend-average">
              {range === 'week' ? '7-day' : '30-day'} average: <span className="font-semibold text-on-surface">{history.average}/100</span>
            </p>
          )}
        </div>

        <div className="space-y-5">
          {BREAKDOWN.map((item) => (
            <div key={item.label} data-testid={`health-score-metric-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="mb-1 flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                <span>{item.label}</span>
                <span>{item.value}/100</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-variant">
                <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
