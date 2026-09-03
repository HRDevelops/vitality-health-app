export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface DashboardMetrics {
  greetingName: string;
  date: string;
  healthScore: number;
  healthScoreNote: string;
  steps: number;
  stepsGoal: number;
  caloriesConsumed: number;
  caloriesGoal: number;
  waterMl: number;
  waterGoalMl: number;
  weightKg: number;
  avatarUrl: string;
}

export interface WorkoutEntry {
  id: string;
  title: string;
  steps: number;
  caloriesBurned: number;
  activeMinutes: number;
  distanceKm: number;
  loggedAt: string;
}

export interface ActivityDaily {
  logDate: string;
  steps: number;
  goalSteps: number;
  progressPercent: number;
  caloriesBurned: number;
  distanceKm: number;
  activeMinutes: number;
  waterMl: number;
  waterGoalMl: number;
  workouts: WorkoutEntry[];
}

export interface ActivityTrendPoint {
  date: string;
  label: string;
  steps: number;
  caloriesBurned: number;
}

export interface ActivityTrends {
  range: 'week' | 'month';
  points: ActivityTrendPoint[];
  totalSteps: number;
  avgSteps: number;
}

export interface NutritionLogItem {
  id: string;
  mealType: MealType;
  foodName: string;
  imageUrl: string;
  calories: number;
  carbsGrams: number;
  proteinGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sugarGrams: number;
  warningNote: string | null;
}

export interface MealSummary {
  mealType: MealType;
  items: NutritionLogItem[];
  calories: number;
  caloriesGoal: number;
}

export interface MacroBreakdown {
  carbs: { grams: number; goalGrams: number; percent: number };
  protein: { grams: number; goalGrams: number; percent: number };
  fat: { grams: number; goalGrams: number; percent: number };
}

export interface NutritionLogsResponse {
  logDate: string;
  meals: MealSummary[];
  totals: { calories: number; carbsGrams: number; proteinGrams: number; fatGrams: number };
  macroBreakdown: MacroBreakdown;
}

export interface Podcast {
  id: string;
  title: string;
  author: string;
  durationMinutes: number;
  audioUrl: string;
  imageUrl: string;
  isPremium: boolean;
  isDailyPick: boolean;
  category: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  healthScore: number;
  healthScoreNote: string;
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  age: number;
  isPremium: boolean;
  podcastSessionsCompleted: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarUrl: string;
  steps: number;
  isCurrentUser: boolean;
  rank: number;
}

export interface Reminder {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  enabled: boolean;
}
