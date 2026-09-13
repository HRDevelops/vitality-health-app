import { Router } from 'express';
import dashboardRoutes from './dashboardRoutes';
import activityRoutes from './activityRoutes';
import nutritionRoutes from './nutritionRoutes';
import podcastRoutes from './podcastRoutes';
import userRoutes from './userRoutes';
import communityRoutes from './communityRoutes';
import authRoutes from './authRoutes';
import healthMetricRoutes from './healthMetricRoutes';
import moveActivityRoutes from './moveActivityRoutes';
import leaderboardRoutes from './leaderboardRoutes';
import careCircleRoutes from './careCircleRoutes';
import scanRoutes from './scanRoutes';
import achievementRoutes from './achievementRoutes';
import onboardingRoutes from './onboardingRoutes';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.use('/dashboard', requireAuth, dashboardRoutes);
router.use('/activity', requireAuth, activityRoutes);
router.use('/move', requireAuth, moveActivityRoutes);
router.use('/leaderboards', requireAuth, leaderboardRoutes);
router.use('/care-circle', requireAuth, careCircleRoutes);
router.use('/scans', requireAuth, scanRoutes);
router.use('/achievements', requireAuth, achievementRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/nutrition', requireAuth, nutritionRoutes);
router.use('/podcasts', podcastRoutes);
router.use('/user', requireAuth, userRoutes);
router.use('/users', requireAuth, userRoutes);
router.use('/community', requireAuth, communityRoutes);
router.use('/health-metrics', requireAuth, healthMetricRoutes);
router.use('/auth', authRoutes);

export default router;
