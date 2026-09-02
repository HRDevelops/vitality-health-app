import { useState } from 'react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { useUpdateWeight } from '../../../services/api/user';
import { useToast } from '../../../components/ui/ToastContext';

interface EditWeightModalProps {
  currentWeightKg: number;
  onClose: () => void;
}

export default function EditWeightModal({ currentWeightKg, onClose }: EditWeightModalProps) {
  const [weight, setWeight] = useState(String(currentWeightKg));
  const updateWeight = useUpdateWeight();
  const { showToast } = useToast();

  const handleSubmit = () => {
    const parsed = Number(weight);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    updateWeight.mutate(parsed, {
      onSuccess: () => {
        showToast('Weight updated!');
        onClose();
      },
    });
  };

  return (
    <BottomSheet title="Update Weight" subtitle="Log your latest weight" onClose={onClose} testId="edit-weight-modal-overlay">
      <div className="space-y-4" data-testid="edit-weight-modal">
        <input
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          type="number"
          step="0.1"
          placeholder="Weight (kg)"
          className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-center font-metric-display text-metric-display text-on-surface outline-none focus:ring-2 focus:ring-primary"
          data-testid="edit-weight-input"
        />
        <button
          onClick={handleSubmit}
          disabled={updateWeight.isPending}
          className="w-full rounded-xl bg-primary py-4 font-headline-md text-sm text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          data-testid="edit-weight-submit-button"
        >
          {updateWeight.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </BottomSheet>
  );
}
