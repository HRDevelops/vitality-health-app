import { Podcast, IPodcast } from '../models/Podcast';

export class PodcastRepository {
  async findAll(): Promise<IPodcast[]> {
    return Podcast.find().sort({ isDailyPick: -1, createdAt: 1 }).exec();
  }

  async findById(id: string): Promise<IPodcast | null> {
    return Podcast.findById(id).exec();
  }
}

export const podcastRepository = new PodcastRepository();
