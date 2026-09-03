import { Router } from 'express';
import { getMetrics, getWeeklyDigest } from '../controllers/dashboardController';

const router = Router();
router.get('/metrics', getMetrics);
router.get('/weekly-digest', getWeeklyDigest);

export default router;
