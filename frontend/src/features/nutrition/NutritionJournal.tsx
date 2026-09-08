import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import TopBar from '../../core/components/TopBar';
import { useNutritionLogs } from '../../services/api/nutrition';
import { ListSkeleton } from '../../components/ui/Skeleton';
import { NutritionLogItem } from '../../types/domain';
import WeeklyCalendar from './components/WeeklyCalendar';
import MealCard from './components/MealCard';
import MealDetailModal from './components/MealDetailModal';
import AddMealModal from './components/AddMealModal';

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

const VISIBLE_MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'SNACK'];

export default function NutritionJournal() {
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [selectedItem, setSelectedItem] = useState<NutritionLogItem | null>(null);
  const [addMealOpen, setAddMealOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if ((location.state as any)?.openAddMeal) {
      setAddMealOpen(true);
    }
  }, [location.state]);

  const { data, isLoading } = useNutritionLogs(selectedDate);

  const visibleMeals = useMemo(() => {
    if (!data) return [];
    const query = search.trim().toLowerCase();
    return data.meals
      .filter((m) => VISIBLE_MEAL_TYPES.includes(m.mealType))
      .map((m) => ({
        ...m,
        items: query === '' ? m.items : m.items.filter((item) => item.foodName.toLowerCase().includes(query)),
      }));
  }, [data, search]);

  const mealLabels: Record<string, string> = { BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner', SNACK: 'Snack' };

  return (
    <div data-testid="nutrition-journal-screen">
      <TopBar title="Journal" showBack rightSlot={<div className="h-10 w-10" />} />

      <main className="space-y-section-gap px-container-margin pb-24 pt-4">
        <div className="space-y-4 rounded-xl bg-primary p-card-padding text-on-primary">
          <WeeklyCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search meal.."
              className="w-full rounded-full border-none bg-surface py-3 pl-12 pr-4 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
              data-testid="nutrition-search-input"
            />
          </div>
        </div>

        {isLoading && <ListSkeleton rows={2} />}

        {data && (
          <>
            {visibleMeals.map((meal) => (
              <MealCard
                key={meal.mealType}
                meal={meal}
                label={mealLabels[meal.mealType]}
                onAdd={() => setAddMealOpen(true)}
                onItemClick={setSelectedItem}
              />
            ))}

            <section className="rounded-xl bg-surface-container-lowest p-card-padding shadow-soft" data-testid="nutrition-macro-facts">
              <h3 className="mb-6 font-headline-md text-headline-md text-on-surface">Nutrition Fact</h3>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                    <span>Carbs</span>
                    <span>
                      {data.macroBreakdown.carbs.grams}g / {data.macroBreakdown.carbs.goalGrams}g
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-variant">
                    <div className="h-full rounded-full bg-secondary-fixed-dim" style={{ width: `${data.macroBreakdown.carbs.percent}%` }} />
                  </div>
                </div>
              </div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                    <span>Protein</span>
                    <span>
                      {data.macroBreakdown.protein.grams}g / {data.macroBreakdown.protein.goalGrams}g
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-variant">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${data.macroBreakdown.protein.percent}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                    <span>Fat</span>
                    <span>
                      {data.macroBreakdown.fat.grams}g / {data.macroBreakdown.fat.goalGrams}g
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-variant">
                    <div className="h-full rounded-full bg-secondary" style={{ width: `${data.macroBreakdown.fat.percent}%` }} />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {selectedItem && <MealDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {addMealOpen && <AddMealModal defaultDate={selectedDate} onClose={() => setAddMealOpen(false)} />}
    </div>
  );
}
