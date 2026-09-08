import { ChevronRight } from 'lucide-react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { WorkoutDetail } from './WorkoutDetailModal';

interface AllChallengesModalProps {
  workouts: WorkoutDetail[];
  onSelect: (workout: WorkoutDetail) => void;
  onClose: () => void;
}

export default function AllChallengesModal({ workouts, onSelect, onClose }: AllChallengesModalProps) {
  return (
    <BottomSheet title="All Challenges" subtitle="Pick a challenge to preview" onClose={onClose} testId="all-challenges-modal-overlay">
      <div className="space-y-3" data-testid="all-challenges-modal">
        {workouts.map((w) => (
          <button
            key={w.id}
            onClick={() => onSelect(w)}
            data-testid={`all-challenges-item-${w.id}`}
            className="flex w-full items-center justify-between rounded-2xl bg-surface-container-low p-4 text-left transition-colors hover:bg-surface-container"
          >
            <div>
              <p className="font-body-lg text-body-lg font-semibold text-on-surface">{w.title}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {w.difficulty} • {w.durationLabel} • {w.calorieTarget} kcal
              </p>
            </div>
            <ChevronRight size={18} className="flex-shrink-0 text-outline" />
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
