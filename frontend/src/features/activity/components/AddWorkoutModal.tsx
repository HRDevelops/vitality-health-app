import { useState } from 'react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { useLogWorkout } from '../../../services/api/activity';
import { useToast } from '../../../components/ui/ToastContext';

interface AddWorkoutModalProps {
  onClose: () => void;
}

const presets = [
  { label: 'Walk 20 min', steps: 2200, caloriesBurned: 90, distanceKm: 1.6, activeMinutes: 20 },
  { label: 'Run 30 min', steps: 4500, caloriesBurned: 320, distanceKm: 4.8, activeMinutes: 30 },
  { label: 'Gym Session', steps: 800, caloriesBurned: 250, distanceKm: 0.4, activeMinutes: 45 },
];

export default function AddWorkoutModal({ onClose }: AddWorkoutModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const logWorkout = useLogWorkout();
  const { showToast } = useToast();

  const handleSubmit = () => {
    const preset = presets[selectedIndex];
    logWorkout.mutate(
      { steps: preset.steps, caloriesBurned: preset.caloriesBurned, distanceKm: preset.distanceKm, activeMinutes: preset.activeMinutes },
      { onSuccess: () => { showToast('Workout logged!'); onClose(); } }
    );
  };

  return (
    <BottomSheet title="Add Workout" subtitle="Pick a session to log" onClose={onClose} testId="add-workout-modal-overlay">
      <div className="space-y-3" data-testid="add-workout-modal">
        {presets.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setSelectedIndex(i)}
            data-testid={`add-workout-preset-${i}`}
            className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-colors ${
              selectedIndex === i ? 'border-primary bg-surface-container' : 'border-outline-variant/30 bg-surface'
            }`}
          >
            <span className="font-body-lg text-body-lg font-semibold text-on-surface">{p.label}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">{p.caloriesBurned} kcal</span>
          </button>
        ))}
        <button
          onClick={handleSubmit}
          disabled={logWorkout.isPending}
          className="w-full rounded-xl bg-primary py-4 font-headline-md text-sm text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          data-testid="add-workout-submit-button"
        >
          {logWorkout.isPending ? 'Logging...' : 'Log Workout'}
        </button>
      </div>
    </BottomSheet>
  );
}
