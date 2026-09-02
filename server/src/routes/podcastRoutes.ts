import { Router } from 'express';
import { listPodcasts, getPodcast } from '../controllers/podcastController';

const router = Router();
router.get('/', listPodcasts);
router.get('/:id', getPodcast);

export default router;
