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
  range: 'daily' | 'week' | 'month';
  points: ActivityTrendPoint[];
  totalSteps: number;
  avgSteps: number;
}

export interface WaterTrendPoint {
  date: string;
  label: string;
  waterMl: number;
}

export interface WaterTrend {
  points: WaterTrendPoint[];
  goalMl: number;
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
  tags: string[];
  description: string;
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
  stepGoal: number;
  waterGoal: number;
  calorieGoal: number;
  macros: { protein: number; carbs: number; fat: number };
  podcastSessionsCompleted: number;
  podcastStreakCount: number;
  streakFreezeAvailable: boolean;
  streakFreezeEquipped: boolean;
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

export interface WeeklyDigest {
  startDate: string;
  endDate: string;
  totalSteps: number;
  bestStepDay: { date: string; label: string; steps: number };
  totalCaloriesConsumed: number;
  macroAdherencePercent: number;
  mindfulnessMinutes: number;
  podcastSessionsCompleted: number;
  podcastStreakCount: number;
  milestones: string[];
}

export interface HealthScoreHistoryPoint {
  date: string;
  label: string;
  score: number;
}

export interface HealthScoreHistory {
  range: 'week' | 'month';
  points: HealthScoreHistoryPoint[];
  average: number;
}

export interface IntensityZone {
  zone: 'light' | 'moderate' | 'hard' | 'peak';
  label: string;
  color: string;
  minutes: number;
  percent: number;
}

export interface IntensityTrend {
  zones: IntensityZone[];
  totalMinutes: number;
  totalWorkouts: number;
}

export type HealthMetricType = 'blood_pressure' | 'blood_glucose';
export type HealthMetricUiToken = 'Fern' | 'Saffron' | 'Clay';
export type GlucoseUnit = 'MG_DL' | 'MMOL_L';

export interface HealthMetric {
  id: string;
  userId: string;
  type: HealthMetricType;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  glucoseValue?: number; // stored in mg/dL
  glucoseUnit: GlucoseUnit;
  isFasting: boolean;
  category: string;
  uiToken: HealthMetricUiToken;
  isCriticalAlert: boolean;
  notes?: string;
  loggedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HealthMetricSummary {
  latestBp: HealthMetric | null;
  latestGlucose: HealthMetric | null;
  averages: {
    avgSystolic: number | null;
    avgDiastolic: number | null;
    avgPulse: number | null;
    avgGlucose: number | null;
  };
  categoryDistributions: {
    bloodPressure: Record<string, number>;
    bloodGlucose: Record<string, number>;
  };
  highestRiskFlag: HealthMetricUiToken;
  totalReadings: number;
}

export interface CreateHealthMetricInput {
  type: HealthMetricType;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  glucoseValue?: number;
  glucoseUnit?: GlucoseUnit;
  isFasting?: boolean;
  notes?: string;
  loggedAt?: string;
}

export type MoveActivityType = 'WALKATHON' | 'CYCLING';

export interface MoveActivity {
  id: string;
  userId: string;
  activityType: MoveActivityType;
  distanceKm: number;
  durationMinutes: number;
  co2SavingsKg: number;
  averagePaceKmh: number;
  isFlagged: boolean;
  flagReason?: string;
  loggedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MoveSummary {
  totalVerifiedDistanceKm: number;
  totalCo2SavingsKg: number;
  walkathonKm: number;
  cyclingKm: number;
  totalActivities: number;
  verifiedActivitiesCount: number;
  flaggedActivitiesCount: number;
  activeStrikes: number;
}

export interface LogMoveActivityInput {
  activityType: MoveActivityType;
  distanceKm: number;
  durationMinutes: number;
  loggedAt?: string;
}

export type LeaderboardTier = 'INDIVIDUAL' | 'TEAMS' | 'UNIVERSITIES';
export type LeaderboardTimeframe = 'weekly' | 'all_time';

export interface University {
  id: string;
  name: string;
  shortCode: string;
  logoUrl?: string;
  totalKm: number;
  totalCo2Kg: number;
}

export interface Team {
  id: string;
  name: string;
  universityId: string | University;
  captainId?: string;
  memberCount: number;
  totalKm: number;
  totalCo2Kg: number;
}

export interface CampusLeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatarUrl?: string;
  logoUrl?: string;
  subtitle?: string;
  universityName?: string;
  universityShortCode?: string;
  teamName?: string;
  memberCount?: number;
  totalKm: number;
  totalCo2Kg: number;
  activityCount: number;
  isCurrent?: boolean;
}

export interface LeaderboardResponse {
  entries: CampusLeaderboardEntry[];
  currentUserEntry?: CampusLeaderboardEntry | null;
  currentTeamEntry?: CampusLeaderboardEntry | null;
  currentUniversityEntry?: CampusLeaderboardEntry | null;
  timeframe: LeaderboardTimeframe;
  tier: LeaderboardTier;
}


