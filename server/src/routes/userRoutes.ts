import { Router } from 'express';
import { getProfile, updateWeight, updateProfile, updateStreakFreeze } from '../controllers/userController';
import { listReminders, updateReminder } from '../controllers/reminderController';

const router = Router();
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/weight', updateWeight);
router.put('/streak-freeze', updateStreakFreeze);
router.get('/reminders', listReminders);
router.put('/reminders/:id', updateReminder);

export default router;
