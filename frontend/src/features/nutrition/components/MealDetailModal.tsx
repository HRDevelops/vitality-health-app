import { Flame } from 'lucide-react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { NutritionLogItem } from '../../../types/domain';

interface MealDetailModalProps {
  item: NutritionLogItem;
  onClose: () => void;
}

function MacroRing({ percent, label, color }: { percent: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 15.9155;
  const dash = (percent / 100) * circumference;
  return (
    <div className="text-center">
      <div className="relative mb-2 h-16 w-16">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-surface-variant"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${dash}, 100`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-label-bold text-label-bold text-on-surface">{percent}%</div>
      </div>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{label}</span>
    </div>
  );
}

export default function MealDetailModal({ item, onClose }: MealDetailModalProps) {
  const total = item.carbsGrams + item.proteinGrams + item.fatGrams || 1;
  const carbsPct = Math.round((item.carbsGrams / total) * 100);
  const proteinPct = Math.round((item.proteinGrams / total) * 100);
  const fatPct = Math.round((item.fatGrams / total) * 100);

  return (
    <BottomSheet onClose={onClose} testId="meal-detail-modal-overlay">
      <div data-testid="meal-detail-modal">
        {item.imageUrl && (
          <div className="mb-4 h-40 w-full overflow-hidden rounded-xl">
            <img src={item.imageUrl} alt={item.foodName} className="h-full w-full object-cover" />
          </div>
        )}
        <p className="mb-2 font-label-bold text-label-bold uppercase tracking-widest text-outline">Nutrition</p>
        <h3 className="mb-4 font-headline-md text-headline-md text-on-surface">{item.foodName}</h3>
        <div className="mb-6 flex items-baseline gap-2">
          <Flame size={18} className="text-primary" />
          <span className="font-metric-display text-metric-display text-on-surface">
            {item.calories} <span className="font-body-sm text-body-sm font-normal text-on-surface-variant">kcal</span>
          </span>
        </div>
        <div className="mb-6 flex justify-between px-2">
          <MacroRing percent={carbsPct} label="Carbs" color="#28d9f3" />
          <MacroRing percent={proteinPct} label="Protein" color="#5445cf" />
          <MacroRing percent={fatPct} label="Fat" color="#006876" />
        </div>
        <div className="space-y-3 border-t border-surface-variant pt-4">
          <div className="flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface">Protein</span>
            <span className="font-body-sm text-body-sm text-on-surface">{item.proteinGrams} g</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface">Carbs</span>
            <span className="font-body-sm text-body-sm text-on-surface">{item.carbsGrams} g</span>
          </div>
          <div className="flex items-center justify-between pl-4">
            <span className="text-xs font-body-sm text-outline">Fiber</span>
            <span className="text-xs font-body-sm text-outline">{item.fiberGrams} g</span>
          </div>
          <div className="flex items-center justify-between pl-4">
            <span className="text-xs font-body-sm text-outline">Sugars</span>
            <span className="text-xs font-body-sm text-outline">{item.sugarGrams} g</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface">Fat</span>
            <span className="font-body-sm text-body-sm text-on-surface">{item.fatGrams} g</span>
          </div>
        </div>
        {item.warningNote && (
          <div className="mt-4 rounded-lg bg-surface-container p-4">
            <p className="font-body-sm text-body-sm text-on-surface">{item.foodName} is flagged: {item.warningNote}</p>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
