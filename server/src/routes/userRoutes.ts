import { Router } from 'express';
import { getProfile, updateWeight, updateProfile, updateStreakFreeze, changePassword } from '../controllers/userController';
import { listReminders, updateReminder } from '../controllers/reminderController';
import { toggleDemoMode, submitAppRating } from '../controllers/onboardingController';

const router = Router();
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/weight', updateWeight);
router.put('/password', changePassword);
router.put('/streak-freeze', updateStreakFreeze);
router.post('/demo-mode', toggleDemoMode);
router.post('/rate', submitAppRating);
router.get('/reminders', listReminders);
router.put('/reminders/:id', updateReminder);

export default router;

