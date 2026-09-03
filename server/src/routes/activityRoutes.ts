import { Router } from 'express';
import { getDaily, getTrends, logWater, logWorkout, deleteWorkout } from '../controllers/activityController';

const router = Router();
router.get('/daily', getDaily);
router.get('/trends', getTrends);
router.post('/water', logWater);
router.post('/log', logWorkout);
router.delete('/workout/:workoutId', deleteWorkout);

export default router;
