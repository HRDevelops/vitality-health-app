import { podcastRepository } from '../repositories/PodcastRepository';
import { userRepository } from '../repositories/UserRepository';
import { todayString, addDaysString } from '../utils/date';

export class PodcastService {
  async listAll() {
    return podcastRepository.findAll();
  }

  async getById(id: string) {
    const podcast = await podcastRepository.findById(id);
    if (!podcast) throw new Error('Podcast not found');
    return podcast;
  }

  async logListen(userId: string, id: string) {
    const podcast = await podcastRepository.findById(id);
    if (!podcast) throw new Error('Podcast not found');
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const today = todayString();
    let streakCount: number;
    let freezeConsumedNow = false;
    if (user.lastListenDate === today) {
      streakCount = user.podcastStreakCount;
    } else if (user.lastListenDate === addDaysString(today, -1)) {
      streakCount = user.podcastStreakCount + 1;
    } else if (user.lastListenDate === addDaysString(today, -2) && user.streakFreezeEquipped && user.streakFreezeAvailable) {
      streakCount = user.podcastStreakCount + 1;
      freezeConsumedNow = true;
    } else {
      streakCount = 1;
    }

    const updatedUser = await userRepository.recordPodcastListen(user.id, streakCount, today, freezeConsumedNow);
    return {
      podcastSessionsCompleted: updatedUser?.podcastSessionsCompleted ?? 0,
      podcastStreakCount: updatedUser?.podcastStreakCount ?? streakCount,
      streakFreezeUsed: freezeConsumedNow,
    };
  }
}

export const podcastService = new PodcastService();
