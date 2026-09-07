import { Router } from 'express';
import dashboardRoutes from './dashboardRoutes';
import activityRoutes from './activityRoutes';
import nutritionRoutes from './nutritionRoutes';
import podcastRoutes from './podcastRoutes';
import userRoutes from './userRoutes';
import communityRoutes from './communityRoutes';
import authRoutes from './authRoutes';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.use('/dashboard', requireAuth, dashboardRoutes);
router.use('/activity', requireAuth, activityRoutes);
router.use('/nutrition', requireAuth, nutritionRoutes);
router.use('/podcasts', podcastRoutes);
router.use('/user', requireAuth, userRoutes);
router.use('/community', communityRoutes);
router.use('/auth', authRoutes);

export default router;
