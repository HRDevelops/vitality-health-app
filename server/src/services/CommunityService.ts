import { communityRepository } from '../repositories/CommunityRepository';
import { userRepository } from '../repositories/UserRepository';
import { activityRepository } from '../repositories/ActivityRepository';
import { todayString, lastNDates } from '../utils/date';

export class CommunityService {
  async getLeaderboard(userId: string, range: 'today' | 'week') {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const friends = await communityRepository.findAll();

    let userSteps: number;
    if (range === 'week') {
      const end = todayString();
      const dateList = lastNDates(7, end);
      const logs = await activityRepository.findByDateRange(user.id, dateList[0], end);
      userSteps = logs.reduce((sum, l) => sum + l.steps, 0);
    } else {
      const activity = await activityRepository.findByDate(user.id, todayString());
      userSteps = activity?.steps ?? 0;
    }

    const entries = [
      ...friends.map((f) => ({
        id: f.id,
        name: f.name,
        avatarUrl: f.avatarUrl,
        steps: range === 'week' ? f.weeklySteps : f.steps,
        isCurrentUser: false,
      })),
      { id: user.id, name: user.name, avatarUrl: user.avatarUrl, steps: userSteps, isCurrentUser: true },
    ];

    entries.sort((a, b) => b.steps - a.steps);
    return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
  }
}

export const communityService = new CommunityService();
