import BottomSheet from '../../../components/ui/BottomSheet';
import { useLogWorkout } from '../../../services/api/activity';
import { useToast } from '../../../components/ui/ToastContext';

export interface WorkoutDetail {
  id: string;
  title: string;
  difficulty: string;
  durationLabel: string;
  calorieTarget: number;
  steps: string[];
  logPayload: { steps?: number; caloriesBurned?: number; distanceKm?: number; activeMinutes?: number };
}

interface WorkoutDetailModalProps {
  workout: WorkoutDetail;
  onClose: () => void;
}

export default function WorkoutDetailModal({ workout, onClose }: WorkoutDetailModalProps) {
  const logWorkout = useLogWorkout();
  const { showToast } = useToast();

  const handleBegin = () => {
    logWorkout.mutate(workout.logPayload, {
      onSuccess: () => {
        showToast(`${workout.title} logged!`);
        onClose();
      },
    });
  };

  return (
    <BottomSheet title={workout.title} subtitle={`${workout.difficulty} • ${workout.durationLabel}`} onClose={onClose} testId="workout-detail-modal-overlay">
      <div className="space-y-5" data-testid="workout-detail-modal">
        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl bg-surface-container p-4 text-center">
            <p className="font-metric-display text-metric-display text-on-surface">{workout.calorieTarget}</p>
            <p className="font-label-bold text-[10px] uppercase text-on-surface-variant">kcal target</p>
          </div>
          <div className="flex-1 rounded-2xl bg-surface-container p-4 text-center">
            <p className="font-metric-display text-metric-display text-on-surface">{workout.durationLabel}</p>
            <p className="font-label-bold text-[10px] uppercase text-on-surface-variant">duration</p>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-headline-md text-sm text-on-surface">Preview</h4>
          <div className="space-y-2">
            {workout.steps.map((step, i) => (
              <div key={step} className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary font-label-bold text-[11px] text-on-primary">
                  {i + 1}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface">{step}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={handleBegin}
          disabled={logWorkout.isPending}
          className="w-full rounded-xl bg-primary py-4 font-headline-md text-sm text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          data-testid="workout-detail-begin-button"
        >
          {logWorkout.isPending ? 'Logging...' : 'Begin Workout'}
        </button>
      </div>
    </BottomSheet>
  );
}
