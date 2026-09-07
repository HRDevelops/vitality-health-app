import { Router } from 'express';
import { listPodcasts, getPodcast, logListen } from '../controllers/podcastController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.get('/', listPodcasts);
router.get('/:id', getPodcast);
router.post('/:id/listen', requireAuth, logListen);

export default router;
