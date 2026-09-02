import { Router } from 'express';
import { getMetrics } from '../controllers/dashboardController';

const router = Router();
router.get('/metrics', getMetrics);

export default router;
