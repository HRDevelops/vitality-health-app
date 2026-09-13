import { Router } from 'express';
import { logMealScan, logProductScan, getDailySummary } from '../controllers/scanController';

const router = Router();

router.post('/meal', logMealScan);
router.post('/product', logProductScan);
router.get('/daily-summary', getDailySummary);

export default router;
