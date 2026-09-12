import { Router } from 'express';
import { createReading, getHistory, getSummary } from '../controllers/healthMetricController';

const router = Router();

router.post('/', createReading);
router.get('/', getHistory);
router.get('/summary', getSummary);

export default router;
