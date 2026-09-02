import { userRepository } from '../repositories/UserRepository';
import { nutritionRepository } from '../repositories/NutritionRepository';
import { INutritionLog, MealType } from '../models/NutritionLog';
import { todayString } from '../utils/date';

const MACRO_GOALS = { carbsGrams: 250, proteinGrams: 90, fatGrams: 70 };
const CALORIE_GOAL_PER_MEAL = 450;

export class NutritionService {
  async getLogsForDate(date?: string) {
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');
    const logDate = date ?? todayString();
    const logs = await nutritionRepository.findByDate(user.id, logDate);

    const grouped: Record<MealType, INutritionLog[]> = {
      BREAKFAST: [],
      LUNCH: [],
      DINNER: [],
      SNACK: [],
    };
    for (const log of logs) {
      grouped[log.mealType].push(log);
    }

    const mealSummaries = (Object.keys(grouped) as MealType[]).map((mealType) => {
      const items = grouped[mealType];
      const calories = items.reduce((s, i) => s + i.calories, 0);
      return { mealType, items, calories, caloriesGoal: CALORIE_GOAL_PER_MEAL };
    });

    const totals = logs.reduce(
      (acc, l) => ({
        calories: acc.calories + l.calories,
        carbsGrams: acc.carbsGrams + l.carbsGrams,
        proteinGrams: acc.proteinGrams + l.proteinGrams,
        fatGrams: acc.fatGrams + l.fatGrams,
      }),
      { calories: 0, carbsGrams: 0, proteinGrams: 0, fatGrams: 0 }
    );

    const macroBreakdown = {
      carbs: { grams: totals.carbsGrams, goalGrams: MACRO_GOALS.carbsGrams, percent: Math.min(100, Math.round((totals.carbsGrams / MACRO_GOALS.carbsGrams) * 100)) },
      protein: { grams: totals.proteinGrams, goalGrams: MACRO_GOALS.proteinGrams, percent: Math.min(100, Math.round((totals.proteinGrams / MACRO_GOALS.proteinGrams) * 100)) },
      fat: { grams: totals.fatGrams, goalGrams: MACRO_GOALS.fatGrams, percent: Math.min(100, Math.round((totals.fatGrams / MACRO_GOALS.fatGrams) * 100)) },
    };

    return { logDate, meals: mealSummaries, totals, macroBreakdown };
  }

  async createLog(payload: {
    mealType: MealType;
    foodName: string;
    calories: number;
    carbsGrams?: number;
    proteinGrams?: number;
    fatGrams?: number;
    fiberGrams?: number;
    sugarGrams?: number;
    imageUrl?: string;
    logDate?: string;
  }) {
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');

    let warningNote: string | null = null;
    if ((payload.carbsGrams ?? 0) > 40) warningNote = 'Very High Carb!';

    return nutritionRepository.create({
      userId: user._id,
      logDate: payload.logDate ?? todayString(),
      mealType: payload.mealType,
      foodName: payload.foodName,
      calories: payload.calories,
      carbsGrams: payload.carbsGrams ?? 0,
      proteinGrams: payload.proteinGrams ?? 0,
      fatGrams: payload.fatGrams ?? 0,
      fiberGrams: payload.fiberGrams ?? 0,
      sugarGrams: payload.sugarGrams ?? 0,
      imageUrl: payload.imageUrl ?? '',
      warningNote,
    });
  }
}

export const nutritionService = new NutritionService();
