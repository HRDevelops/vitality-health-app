import { podcastRepository } from '../repositories/PodcastRepository';
import { userRepository } from '../repositories/UserRepository';

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
    const updatedUser = await userRepository.incrementPodcastSessions(user.id);
    return { podcastSessionsCompleted: updatedUser?.podcastSessionsCompleted ?? 0 };
  }
}

export const podcastService = new PodcastService();
