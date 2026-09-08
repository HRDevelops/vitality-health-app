import { Router } from 'express';
import { getDaily, getTrends, getWaterTrend, getIntensityTrend, logWater, logWorkout, deleteWorkout } from '../controllers/activityController';

const router = Router();
router.get('/daily', getDaily);
router.get('/trends', getTrends);
router.get('/water-trend', getWaterTrend);
router.get('/intensity-trend', getIntensityTrend);
router.post('/water', logWater);
router.post('/log', logWorkout);
router.delete('/workout/:workoutId', deleteWorkout);

export default router;
