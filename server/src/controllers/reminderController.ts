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

export async function toggleReminder(req: Request, res: Response) {
  try {
    const reminder = await reminderService.toggle(req.params.id, Boolean(req.body.enabled));
    res.json(reminder);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
}
