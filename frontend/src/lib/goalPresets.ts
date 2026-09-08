export interface GoalPreset {
  id: string;
  label: string;
  calorieGoal: number;
  protein: number;
  carbs: number;
  fat: number;
  waterGoal: number;
  stepGoal: number;
}

export const GOAL_PRESETS: GoalPreset[] = [
  { id: 'weight-loss', label: 'Weight Loss', calorieGoal: 1800, protein: 160, carbs: 150, fat: 55, waterGoal: 2500, stepGoal: 12000 },
  { id: 'maintenance', label: 'Maintenance', calorieGoal: 2200, protein: 140, carbs: 240, fat: 70, waterGoal: 2000, stepGoal: 10000 },
  { id: 'muscle-gain', label: 'Muscle Gain', calorieGoal: 2700, protein: 180, carbs: 320, fat: 80, waterGoal: 3000, stepGoal: 8000 },
];

export function matchGoalPreset(user: {
  calorieGoal: number;
  waterGoal: number;
  stepGoal: number;
  macros: { protein: number; carbs: number; fat: number };
}): GoalPreset | null {
  return (
    GOAL_PRESETS.find(
      (p) =>
        p.calorieGoal === user.calorieGoal &&
        p.waterGoal === user.waterGoal &&
        p.stepGoal === user.stepGoal &&
        p.protein === user.macros.protein &&
        p.carbs === user.macros.carbs &&
        p.fat === user.macros.fat
    ) ?? null
  );
}
