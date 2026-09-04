import { Clock, Flame, HeartPulse } from 'lucide-react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { WorkoutEntry } from '../../../types/domain';

interface WorkoutSummaryModalProps {
  workout: WorkoutEntry;
  onClose: () => void;
}

function exertionLevel(caloriesBurned: number, activeMinutes: number) {
  const rate = activeMinutes > 0 ? caloriesBurned / activeMinutes : 0;
  if (rate >= 8) return { label: 'High Intensity', zone: 'Zone 4–5', color: 'text-error' };
  if (rate >= 4) return { label: 'Moderate Intensity', zone: 'Zone 3', color: 'text-secondary' };
  return { label: 'Light Intensity', zone: 'Zone 1–2', color: 'text-primary' };
}

export default function WorkoutSummaryModal({ workout, onClose }: WorkoutSummaryModalProps) {
  const exertion = exertionLevel(workout.caloriesBurned, workout.activeMinutes);
  const stages = [
    { label: 'Warm-up', minutes: Math.max(1, Math.round(workout.activeMinutes * 0.2)) },
    { label: 'Main Set', minutes: Math.max(1, Math.round(workout.activeMinutes * 0.6)) },
    { label: 'Cool-down', minutes: Math.max(1, Math.round(workout.activeMinutes * 0.2)) },
  ];

  return (
    <BottomSheet title={workout.title} subtitle="Workout Summary" onClose={onClose} testId="workout-summary-modal-overlay">
      <div className="space-y-5" data-testid="workout-summary-modal">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-2xl bg-surface-container p-4">
            <Clock size={20} className="mb-1 text-primary" />
            <p className="font-metric-display text-lg text-on-surface">{workout.activeMinutes}</p>
            <p className="font-label-bold text-[9px] uppercase text-on-surface-variant">minutes</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-surface-container p-4">
            <Flame size={20} className="mb-1 text-secondary" />
            <p className="font-metric-display text-lg text-on-surface">{workout.caloriesBurned}</p>
            <p className="font-label-bold text-[9px] uppercase text-on-surface-variant">kcal</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-surface-container p-4" data-testid="workout-summary-exertion">
            <HeartPulse size={20} className={`mb-1 ${exertion.color}`} />
            <p className="font-metric-display text-lg text-on-surface">{exertion.zone}</p>
            <p className="font-label-bold text-[9px] uppercase text-on-surface-variant">{exertion.label}</p>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-headline-md text-sm text-on-surface">Exercise Preview</h4>
          <div className="space-y-2">
            {stages.map((s, i) => (
              <div key={s.label} data-testid={`workout-summary-stage-${i}`} className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary font-label-bold text-[11px] text-on-primary">
                  {i + 1}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface">
                  {s.label} — {s.minutes} min
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
