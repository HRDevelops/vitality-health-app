import { Router } from 'express';
import { submitQuestionnaire, createGuestSession, claimGuest } from '../controllers/onboardingController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/guest-session', createGuestSession);
router.post('/questionnaire', requireAuth, submitQuestionnaire);
router.post('/claim-guest', requireAuth, claimGuest);

export default router;
