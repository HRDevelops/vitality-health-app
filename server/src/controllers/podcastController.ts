import { Request, Response } from 'express';
import { podcastService } from '../services/PodcastService';

export async function listPodcasts(req: Request, res: Response) {
  try {
    const podcasts = await podcastService.listAll();
    res.json(podcasts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function getPodcast(req: Request, res: Response) {
  try {
    const podcast = await podcastService.getById(req.params.id);
    res.json(podcast);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
}
