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

  async logListen(id: string) {
    const podcast = await podcastRepository.findById(id);
    if (!podcast) throw new Error('Podcast not found');
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');

    const today = todayString();
    let streakCount: number;
    if (user.lastListenDate === today) {
      streakCount = user.podcastStreakCount;
    } else if (user.lastListenDate === addDaysString(today, -1)) {
      streakCount = user.podcastStreakCount + 1;
    } else {
      streakCount = 1;
    }

    const updatedUser = await userRepository.recordPodcastListen(user.id, streakCount, today);
    return {
      podcastSessionsCompleted: updatedUser?.podcastSessionsCompleted ?? 0,
      podcastStreakCount: updatedUser?.podcastStreakCount ?? streakCount,
    };
  }
}

export const podcastService = new PodcastService();
