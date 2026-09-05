import { Request, Response } from 'express';
import { reminderService } from '../services/ReminderService';

export async function listReminders(req: Request, res: Response) {
  try {
    const reminders = await reminderService.list();
    res.json(reminders);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateReminder(req: Request, res: Response) {
  try {
    const { enabled, time } = req.body;
    const updates: { enabled?: boolean; time?: string } = {};
    if (enabled !== undefined) updates.enabled = Boolean(enabled);
    if (time !== undefined) updates.time = String(time);
    const reminder = await reminderService.update(req.params.id, updates);
    res.json(reminder);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
}
