import { userRepository } from '../repositories/UserRepository';
import { activityRepository } from '../repositories/ActivityRepository';
import { nutritionRepository } from '../repositories/NutritionRepository';
import { todayString } from '../utils/date';

export class DashboardService {
  async getMetrics() {
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');

    const today = todayString();
    const activity = await activityRepository.findByDate(user.id, today);
    const meals = await nutritionRepository.findByDate(user.id, today);

    const caloriesConsumed = meals.reduce((sum, m) => sum + m.calories, 0);

    return {
      greetingName: user.name,
      date: today,
      healthScore: user.healthScore,
      healthScoreNote: user.healthScoreNote,
      steps: activity?.steps ?? 0,
      stepsGoal: activity?.goalSteps ?? 10000,
      caloriesConsumed,
      caloriesGoal: 2000,
      waterMl: activity?.waterMl ?? 0,
      waterGoalMl: activity?.waterGoalMl ?? 2000,
      weightKg: user.currentWeightKg,
      avatarUrl: user.avatarUrl,
    };
  }
}

export const dashboardService = new DashboardService();
