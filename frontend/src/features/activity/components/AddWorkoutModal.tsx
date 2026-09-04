import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { useLogWorkout } from '../../../services/api/activity';
import { useToast } from '../../../components/ui/ToastContext';

interface AddWorkoutModalProps {
  onClose: () => void;
}

const presets = [
  { label: 'Walking', duration: '20 min', steps: 2200, caloriesBurned: 90, distanceKm: 1.6, activeMinutes: 20 },
  { label: 'Outdoor Run', duration: '30 min', steps: 4500, caloriesBurned: 320, distanceKm: 4.8, activeMinutes: 30 },
  { label: 'Gym Strength Session', duration: '45 min', steps: 800, caloriesBurned: 250, distanceKm: 0.4, activeMinutes: 45 },
  { label: 'HIIT Cardio Blast', duration: '25 min', steps: 2800, caloriesBurned: 280, distanceKm: 1.8, activeMinutes: 25 },
  { label: 'Vinyasa Yoga Flow', duration: '35 min', steps: 300, caloriesBurned: 140, distanceKm: 0, activeMinutes: 35 },
  { label: 'Cycling / Spin', duration: '40 min', steps: 0, caloriesBurned: 360, distanceKm: 12, activeMinutes: 40 },
  { label: 'Pilates Core', duration: '25 min', steps: 200, caloriesBurned: 160, distanceKm: 0, activeMinutes: 25 },
];

export default function AddWorkoutModal({ onClose }: AddWorkoutModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [customOpen, setCustomOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const logWorkout = useLogWorkout();
  const { showToast } = useToast();

  const handleSubmit = () => {
    if (customOpen) {
      const activeMinutes = Number(customDuration) || 0;
      const caloriesBurned = Number(customCalories) || 0;
      if (!customTitle.trim() || activeMinutes <= 0) return;
      logWorkout.mutate(
        { title: customTitle.trim(), caloriesBurned, activeMinutes, steps: 0, distanceKm: 0 },
        {
          onSuccess: () => {
            showToast('Workout logged!');
            onClose();
          },
        }
      );
      return;
    }
    if (selectedIndex === null) return;
    const preset = presets[selectedIndex];
    logWorkout.mutate(
      { title: preset.label, steps: preset.steps, caloriesBurned: preset.caloriesBurned, distanceKm: preset.distanceKm, activeMinutes: preset.activeMinutes },
      {
        onSuccess: () => {
          showToast('Workout logged!');
          onClose();
        },
      }
    );
  };

  const isSubmitDisabled = logWorkout.isPending || (customOpen ? !customTitle.trim() || !customDuration : selectedIndex === null);

  return (
    <BottomSheet title="Add Workout" subtitle="Pick a session to log" onClose={onClose} testId="add-workout-modal-overlay">
      <div className="space-y-3" data-testid="add-workout-modal">
        <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
          {presets.map((p, i) => (
            <button
              key={p.label}
              onClick={() => {
                setSelectedIndex(i);
                setCustomOpen(false);
              }}
              data-testid={`add-workout-preset-${i}`}
              className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-colors ${
                !customOpen && selectedIndex === i ? 'border-primary bg-surface-container' : 'border-outline-variant/30 bg-surface'
              }`}
            >
              <div>
                <span className="block font-body-lg text-body-lg font-semibold text-on-surface">{p.label}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{p.duration}</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{p.caloriesBurned} kcal</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setCustomOpen((o) => !o)}
          data-testid="add-workout-custom-toggle"
          className="flex w-full items-center justify-between rounded-2xl border border-dashed border-outline-variant/40 p-4 text-left transition-colors hover:bg-surface-container-low"
        >
          <span className="font-body-lg text-body-lg font-semibold text-on-surface">Custom Workout</span>
          {customOpen ? <ChevronUp size={18} className="text-outline" /> : <ChevronDown size={18} className="text-outline" />}
        </button>

        {customOpen && (
          <div className="space-y-3 rounded-2xl bg-surface-container-low p-4" data-testid="add-workout-custom-form">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Workout title"
              data-testid="add-workout-custom-title-input"
              className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                placeholder="Duration (mins)"
                data-testid="add-workout-custom-duration-input"
                className="w-1/2 rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                min="0"
                value={customCalories}
                onChange={(e) => setCustomCalories(e.target.value)}
                placeholder="Calories burned"
                data-testid="add-workout-custom-calories-input"
                className="w-1/2 rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="w-full rounded-xl bg-primary py-4 font-headline-md text-sm text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          data-testid="add-workout-submit-button"
        >
          {logWorkout.isPending ? 'Logging...' : 'Log Workout'}
        </button>
      </div>
    </BottomSheet>
  );
}
