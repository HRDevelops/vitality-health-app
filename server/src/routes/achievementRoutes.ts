import { Router } from 'express';
import { getAchievements } from '../controllers/achievementController';

const router = Router();

router.get('/', getAchievements);

export default router;
