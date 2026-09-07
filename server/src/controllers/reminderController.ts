import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { reminderService } from '../services/ReminderService';

export async function listReminders(req: AuthedRequest, res: Response) {
  try {
    const reminders = await reminderService.list(req.userId!);
    res.json(reminders);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateReminder(req: AuthedRequest, res: Response) {
  try {
    const { enabled, time } = req.body;
    const updates: { enabled?: boolean; time?: string } = {};
    if (enabled !== undefined) updates.enabled = Boolean(enabled);
    if (time !== undefined) updates.time = String(time);
    const reminder = await reminderService.update(req.params.id, req.userId!, updates);
    res.json(reminder);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
}
