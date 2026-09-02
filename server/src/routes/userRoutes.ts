import { Router } from 'express';
import { getProfile, updateWeight } from '../controllers/userController';
import { listReminders, toggleReminder } from '../controllers/reminderController';

const router = Router();
router.get('/profile', getProfile);
router.put('/weight', updateWeight);
router.get('/reminders', listReminders);
router.put('/reminders/:id', toggleReminder);

export default router;
