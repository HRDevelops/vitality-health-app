import { Flame, Plus, AlertTriangle } from 'lucide-react';
import { MealSummary, NutritionLogItem } from '../../../types/domain';

interface MealCardProps {
  meal: MealSummary;
  label: string;
  onAdd: () => void;
  onItemClick: (item: NutritionLogItem) => void;
}

export default function MealCard({ meal, label, onAdd, onItemClick }: MealCardProps) {
  return (
    <section className="rounded-xl bg-surface-container-lowest p-card-padding shadow-soft" data-testid={`meal-card-${meal.mealType.toLowerCase()}`}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="mb-1 font-label-bold text-label-bold uppercase tracking-widest text-primary">{label}</h2>
          <div className="flex items-baseline gap-2">
            <Flame size={18} className="text-primary" />
            <span className="font-metric-display text-metric-display text-on-surface">
              {meal.calories}{' '}
              <span className="font-body-sm text-body-sm font-normal text-on-surface-variant">kcal / {meal.caloriesGoal} kcal</span>
            </span>
          </div>
        </div>
        <button
          onClick={onAdd}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-primary transition-colors hover:bg-primary hover:text-on-primary"
          data-testid={`meal-card-add-${meal.mealType.toLowerCase()}`}
        >
          <Plus size={20} />
        </button>
      </div>
      {meal.items.length === 0 ? (
        <p className="py-4 text-center font-body-sm text-body-sm text-outline">No items logged yet</p>
      ) : (
        <div className="space-y-4">
          {meal.items.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick(item)}
              data-testid={`meal-item-${item.id}`}
              className="flex w-full items-center gap-4 rounded-lg p-3 text-left transition-colors hover:bg-surface-variant"
            >
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-variant">
                {item.imageUrl && <img src={item.imageUrl} alt={item.foodName} className="h-full w-full object-cover" />}
                {item.warningNote && (
                  <div className="absolute -bottom-2 -right-2 rounded-full bg-surface p-0.5">
                    <AlertTriangle size={14} className="text-error" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-base font-headline-md text-headline-md text-on-surface">{item.foodName}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{item.calories} cals</p>
                {item.warningNote && (
                  <p className="text-[10px] font-label-bold uppercase text-error">{item.warningNote}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
