import { userRepository } from '../repositories/UserRepository';
import { activityRepository } from '../repositories/ActivityRepository';
import { todayString, lastNDates, weekdayLabel } from '../utils/date';

export class ActivityService {
  async getDaily(date?: string) {
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');
    const logDate = date ?? todayString();
    const log = await activityRepository.findByDate(user.id, logDate);

    const steps = log?.steps ?? 0;
    const goalSteps = log?.goalSteps ?? 10000;

    return {
      logDate,
      steps,
      goalSteps,
      progressPercent: Math.min(100, Math.round((steps / goalSteps) * 100)),
      caloriesBurned: log?.caloriesBurned ?? 0,
      distanceKm: Math.round((log?.distanceKm ?? 0) * 10) / 10,
      activeMinutes: log?.activeMinutes ?? 0,
      waterMl: log?.waterMl ?? 0,
      waterGoalMl: log?.waterGoalMl ?? 2000,
      workouts: (log?.workouts ?? []).map((w) => ({
        id: w._id.toString(),
        title: w.title,
        steps: w.steps,
        caloriesBurned: w.caloriesBurned,
        activeMinutes: w.activeMinutes,
        distanceKm: w.distanceKm,
        loggedAt: w.loggedAt,
      })),
    };
  }

  async getTrends(range: 'week' | 'month') {
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');
    const days = range === 'month' ? 30 : 7;
    const end = todayString();
    const dateList = lastNDates(days, end);
    const logs = await activityRepository.findByDateRange(user.id, dateList[0], end);
    const byDate = new Map(logs.map((l) => [l.logDate, l]));

    const points = dateList.map((d) => {
      const log = byDate.get(d);
      return {
        date: d,
        label: weekdayLabel(d),
        steps: log?.steps ?? 0,
        caloriesBurned: log?.caloriesBurned ?? 0,
      };
    });

    const totalSteps = points.reduce((s, p) => s + p.steps, 0);
    const avgSteps = Math.round(totalSteps / points.length);

    return { range, points, totalSteps, avgSteps };
  }

  async logWater(amountMl: number) {
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');
    const logDate = todayString();
    const log = await activityRepository.incrementFields(user.id, logDate, { waterMl: amountMl });
    return log;
  }

  async logWorkout(payload: { title?: string; steps?: number; caloriesBurned?: number; distanceKm?: number; activeMinutes?: number }) {
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');
    const logDate = todayString();
    const log = await activityRepository.addWorkoutEntry(
      user.id,
      logDate,
      {
        title: payload.title ?? 'Workout',
        steps: payload.steps ?? 0,
        caloriesBurned: payload.caloriesBurned ?? 0,
        activeMinutes: payload.activeMinutes ?? 0,
        distanceKm: payload.distanceKm ?? 0,
      },
      {
        steps: payload.steps ?? 0,
        caloriesBurned: payload.caloriesBurned ?? 0,
        distanceKm: payload.distanceKm ?? 0,
        activeMinutes: payload.activeMinutes ?? 0,
      }
    );
    if (!log) throw new Error('Failed to log workout');
    return this.getDaily(logDate);
  }

  async deleteWorkout(workoutId: string) {
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');
    const logDate = todayString();
    const log = await activityRepository.removeWorkoutEntry(user.id, logDate, workoutId);
    if (!log) throw new Error('Workout not found');
    return this.getDaily(logDate);
  }
}

export const activityService = new ActivityService();
