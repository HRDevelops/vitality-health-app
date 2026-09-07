import { communityRepository } from '../repositories/CommunityRepository';
import { userRepository } from '../repositories/UserRepository';
import { activityRepository } from '../repositories/ActivityRepository';
import { todayString } from '../utils/date';

export class CommunityService {
  async getLeaderboard(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const friends = await communityRepository.findAll();
    const activity = await activityRepository.findByDate(user.id, todayString());

    const entries = [
      ...friends.map((f) => ({ id: f.id, name: f.name, avatarUrl: f.avatarUrl, steps: f.steps, isCurrentUser: false })),
      { id: user.id, name: user.name, avatarUrl: user.avatarUrl, steps: activity?.steps ?? 0, isCurrentUser: true },
    ];

    entries.sort((a, b) => b.steps - a.steps);
    return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
  }
}

export const communityService = new CommunityService();
