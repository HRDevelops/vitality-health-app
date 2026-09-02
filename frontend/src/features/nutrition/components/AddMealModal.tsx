import { useState } from 'react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { useCreateNutritionLog } from '../../../services/api/nutrition';
import { MealType } from '../../../types/domain';
import { useToast } from '../../../components/ui/ToastContext';

interface AddMealModalProps {
  onClose: () => void;
  defaultDate: string;
}

const mealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

export default function AddMealModal({ onClose, defaultDate }: AddMealModalProps) {
  const [mealType, setMealType] = useState<MealType>('BREAKFAST');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [carbs, setCarbs] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const createLog = useCreateNutritionLog();
  const { showToast } = useToast();

  const handleSubmit = () => {
    if (!foodName.trim() || !calories) return;
    createLog.mutate(
      {
        mealType,
        foodName: foodName.trim(),
        calories: Number(calories),
        carbsGrams: Number(carbs) || 0,
        proteinGrams: Number(protein) || 0,
        fatGrams: Number(fat) || 0,
        logDate: defaultDate,
      },
      {
        onSuccess: () => {
          showToast('Added to journal!');
          onClose();
        },
      }
    );
  };

  return (
    <BottomSheet title="Add Meal" subtitle="Log what you ate" onClose={onClose} testId="add-meal-modal-overlay">
      <div className="space-y-4" data-testid="add-meal-modal">
        <div className="flex gap-2">
          {mealTypes.map((mt) => (
            <button
              key={mt}
              onClick={() => setMealType(mt)}
              data-testid={`add-meal-type-${mt.toLowerCase()}`}
              className={`flex-1 rounded-full py-2 font-label-bold text-[11px] transition-colors ${
                mealType === mt ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {mt}
            </button>
          ))}
        </div>
        <input
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          placeholder="Food name"
          className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
          data-testid="add-meal-food-name-input"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            type="number"
            placeholder="Calories (kcal)"
            className="rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            data-testid="add-meal-calories-input"
          />
          <input
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            type="number"
            placeholder="Carbs (g)"
            className="rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            data-testid="add-meal-carbs-input"
          />
          <input
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            type="number"
            placeholder="Protein (g)"
            className="rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            data-testid="add-meal-protein-input"
          />
          <input
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            type="number"
            placeholder="Fat (g)"
            className="rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            data-testid="add-meal-fat-input"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={createLog.isPending || !foodName.trim() || !calories}
          className="w-full rounded-xl bg-primary py-4 font-headline-md text-sm text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          data-testid="add-meal-submit-button"
        >
          {createLog.isPending ? 'Adding...' : 'Add to journal'}
        </button>
      </div>
    </BottomSheet>
  );
}
