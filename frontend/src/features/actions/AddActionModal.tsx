import { Scale, Droplet, Utensils, Dumbbell, AlarmClock, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLogWater } from '../../services/api/activity';
import { useToast } from '../../components/ui/ToastContext';

interface AddActionModalProps {
  onClose: () => void;
}

export default function AddActionModal({ onClose }: AddActionModalProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const logWater = useLogWater();

  const handleAddMeal = () => {
    onClose();
    navigate('/nutrition', { state: { openAddMeal: true } });
  };

  const handleAddWorkout = () => {
    onClose();
    navigate('/activity', { state: { openAddWorkout: true } });
  };

  const handleUpdateWeight = () => {
    onClose();
    navigate('/profile', { state: { openWeightEdit: true } });
  };

  const handleAddDrink = () => {
    logWater.mutate(250, {
      onSuccess: () => showToast('Hydration logged successfully!'),
    });
    onClose();
  };

  const handleSetReminder = () => {
    onClose();
    navigate('/profile', { state: { scrollToReminders: true } });
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(252,248,255,0.85)] backdrop-blur-md animate-fade-in"
      onClick={onClose}
      data-testid="add-action-modal-overlay"
    >
      <button
        onClick={onClose}
        className="absolute right-container-margin top-container-margin z-10 rounded-full bg-surface-container-lowest p-3 text-on-surface shadow-lg transition-transform hover:scale-95"
        data-testid="add-action-modal-close-button"
        aria-label="Close"
      >
        <X size={20} />
      </button>
      <div
        className="w-full max-w-md rounded-t-[3rem] bg-surface-container-lowest p-container-margin pb-12 shadow-[0px_-10px_40px_rgba(84,69,207,0.15)] animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
        data-testid="add-action-modal-sheet"
      >
        <div className="mb-section-gap pt-4 text-center">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Quick Actions</h2>
          <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">What would you like to log today?</p>
        </div>
        <div className="grid grid-cols-2 gap-gutter">
          <button
            onClick={handleUpdateWeight}
            className="group flex flex-col items-center justify-center rounded-2xl border border-transparent bg-surface-container-low p-card-padding shadow-sm transition-all duration-200 hover:border-primary-fixed-dim hover:bg-surface-container hover:shadow-md"
            data-testid="action-update-weight"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-container to-secondary-container shadow-lg transition-transform duration-200 group-hover:scale-110">
              <Scale size={28} className="text-on-primary" />
            </div>
            <span className="font-headline-md text-headline-md text-on-surface transition-colors group-hover:text-primary">Update Weight</span>
          </button>
          <button
            onClick={handleAddDrink}
            className="group flex flex-col items-center justify-center rounded-2xl border border-transparent bg-surface-container-low p-card-padding shadow-sm transition-all duration-200 hover:border-secondary-fixed-dim hover:bg-surface-container hover:shadow-md"
            data-testid="action-add-drink"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary-fixed-dim shadow-lg transition-transform duration-200 group-hover:scale-110">
              <Droplet size={28} className="text-on-secondary" />
            </div>
            <span className="font-headline-md text-headline-md text-on-surface transition-colors group-hover:text-secondary">Add Drink</span>
          </button>
          <button
            onClick={handleAddMeal}
            className="group flex flex-col items-center justify-center rounded-2xl border border-transparent bg-surface-container-low p-card-padding shadow-sm transition-all duration-200 hover:border-tertiary-fixed-dim hover:bg-surface-container hover:shadow-md"
            data-testid="action-add-meal"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-tertiary to-tertiary-fixed-dim shadow-lg transition-transform duration-200 group-hover:scale-110">
              <Utensils size={28} className="text-on-tertiary" />
            </div>
            <span className="font-headline-md text-headline-md text-on-surface transition-colors group-hover:text-tertiary">Add Meal</span>
          </button>
          <button
            onClick={handleAddWorkout}
            className="group flex flex-col items-center justify-center rounded-2xl border border-transparent bg-surface-container-low p-card-padding shadow-sm transition-all duration-200 hover:border-primary-fixed-dim hover:bg-surface-container hover:shadow-md"
            data-testid="action-add-workout"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-fixed-dim to-secondary-fixed shadow-lg transition-transform duration-200 group-hover:scale-110">
              <Dumbbell size={28} className="text-on-primary-fixed-variant" />
            </div>
            <span className="font-headline-md text-headline-md text-on-surface transition-colors group-hover:text-primary">Add Workout</span>
          </button>
          <button
            onClick={handleSetReminder}
            className="group col-span-2 mt-2 flex items-center justify-between rounded-2xl border border-transparent bg-surface-container-low p-card-padding shadow-sm transition-all duration-200 hover:border-outline-variant hover:bg-surface-container hover:shadow-md"
            data-testid="action-set-reminder"
          >
            <div className="flex items-center gap-element-gap">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-variant transition-colors duration-200 group-hover:bg-primary-fixed">
                <AlarmClock size={20} className="text-on-surface-variant transition-colors duration-200 group-hover:text-primary" />
              </div>
              <div className="text-left">
                <span className="block font-headline-md text-headline-md text-on-surface transition-colors group-hover:text-primary">Set Reminder</span>
                <span className="block font-body-sm text-body-sm text-on-surface-variant">Schedule notifications</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-outline transition-colors group-hover:text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}
