import { Router } from 'express';
import { listPodcasts, getPodcast, logListen } from '../controllers/podcastController';

const router = Router();
router.get('/', listPodcasts);
router.get('/:id', getPodcast);
router.post('/:id/listen', logListen);

export default router;
