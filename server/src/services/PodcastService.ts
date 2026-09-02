import { podcastRepository } from '../repositories/PodcastRepository';

export class PodcastService {
  async listAll() {
    return podcastRepository.findAll();
  }

  async getById(id: string) {
    const podcast = await podcastRepository.findById(id);
    if (!podcast) throw new Error('Podcast not found');
    return podcast;
  }
}

export const podcastService = new PodcastService();
