import { userRepository } from '../repositories/UserRepository';
import { activityRepository } from '../repositories/ActivityRepository';
import { nutritionRepository } from '../repositories/NutritionRepository';
import { podcastRepository } from '../repositories/PodcastRepository';
import { todayString, lastNDates, weekdayLabel } from '../utils/date';

const WEEKLY_MACRO_GOALS = { carbsGrams: 250 * 7, proteinGrams: 90 * 7, fatGrams: 70 * 7 };

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

  async getWeeklyDigest() {
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');

    const endDate = todayString();
    const dateList = lastNDates(7, endDate);
    const startDate = dateList[0];

    const activityLogs = await activityRepository.findByDateRange(user.id, startDate, endDate);
    const byDate = new Map(activityLogs.map((l) => [l.logDate, l]));

    let totalSteps = 0;
    let bestStepDay = { date: startDate, steps: 0 };
    for (const d of dateList) {
      const steps = byDate.get(d)?.steps ?? 0;
      totalSteps += steps;
      if (steps > bestStepDay.steps) bestStepDay = { date: d, steps };
    }

    let totalCaloriesConsumed = 0;
    const macroTotals = { carbsGrams: 0, proteinGrams: 0, fatGrams: 0 };
    for (const d of dateList) {
      const meals = await nutritionRepository.findByDate(user.id, d);
      for (const m of meals) {
        totalCaloriesConsumed += m.calories;
        macroTotals.carbsGrams += m.carbsGrams;
        macroTotals.proteinGrams += m.proteinGrams;
        macroTotals.fatGrams += m.fatGrams;
      }
    }

    const macroAdherencePercent = Math.round(
      (Math.min(100, (macroTotals.carbsGrams / WEEKLY_MACRO_GOALS.carbsGrams) * 100) +
        Math.min(100, (macroTotals.proteinGrams / WEEKLY_MACRO_GOALS.proteinGrams) * 100) +
        Math.min(100, (macroTotals.fatGrams / WEEKLY_MACRO_GOALS.fatGrams) * 100)) /
        3
    );

    const podcasts = await podcastRepository.findAll();
    const avgPodcastMinutes = podcasts.length ? Math.round(podcasts.reduce((s, p) => s + p.durationMinutes, 0) / podcasts.length) : 10;
    const mindfulnessMinutes = user.podcastSessionsCompleted * avgPodcastMinutes;

    const milestones: string[] = [];
    if (bestStepDay.steps >= 10000) milestones.push(`Hit 10k+ steps on ${weekdayLabel(bestStepDay.date)}`);
    if (user.podcastStreakCount >= 3) milestones.push(`${user.podcastStreakCount}-day mindfulness streak`);
    if (user.podcastSessionsCompleted >= 3) milestones.push('Unlocked the Mindful Master badge');
    if (totalSteps >= 50000) milestones.push('Walked over 50,000 steps this week');
    if (milestones.length === 0) milestones.push('Consistent logging all week — keep it up!');

    return {
      startDate,
      endDate,
      totalSteps,
      bestStepDay: { date: bestStepDay.date, label: weekdayLabel(bestStepDay.date), steps: bestStepDay.steps },
      totalCaloriesConsumed,
      macroAdherencePercent,
      mindfulnessMinutes,
      podcastSessionsCompleted: user.podcastSessionsCompleted,
      podcastStreakCount: user.podcastStreakCount,
      milestones,
    };
  }
}

export const dashboardService = new DashboardService();
