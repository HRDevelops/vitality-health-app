import { Router } from 'express';
import { getLeaderboard } from '../controllers/communityController';

const router = Router();
router.get('/leaderboard', getLeaderboard);

export default router;
