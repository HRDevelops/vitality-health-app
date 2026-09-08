import { Router } from 'express';
import { getMetrics, getWeeklyDigest, getHealthScoreHistory } from '../controllers/dashboardController';

const router = Router();
router.get('/metrics', getMetrics);
router.get('/weekly-digest', getWeeklyDigest);
router.get('/health-score-history', getHealthScoreHistory);

export default router;
