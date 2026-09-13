import { Router } from 'express';
import { logActivity, getActivities, getSummary } from '../controllers/moveActivityController';

const router = Router();

router.post('/activity', logActivity);
router.get('/activities', getActivities);
router.get('/summary', getSummary);

export default router;
