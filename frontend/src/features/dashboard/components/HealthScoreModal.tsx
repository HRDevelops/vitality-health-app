import BottomSheet from '../../../components/ui/BottomSheet';

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
  return (
    <BottomSheet
      title="Health Score Breakdown"
      subtitle={`Overall score: ${score}/100`}
      onClose={onClose}
      testId="health-score-modal-overlay"
    >
      <div className="space-y-5" data-testid="health-score-modal">
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
    </BottomSheet>
  );
}
