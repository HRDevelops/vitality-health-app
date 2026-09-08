import { Reminder, IReminder } from '../models/Reminder';

export class ReminderRepository {
  async findByUser(userId: string): Promise<IReminder[]> {
    return Reminder.find({ userId }).sort({ time: 1 }).exec();
  }

  async update(id: string, userId: string, updates: Partial<Pick<IReminder, 'enabled' | 'time'>>): Promise<IReminder | null> {
    return Reminder.findOneAndUpdate({ _id: id, userId }, updates, { new: true, runValidators: true }).exec();
  }

  async copyTemplateForUser(userId: string, sourceUserId: string): Promise<void> {
    const templates = await Reminder.find({ userId: sourceUserId }).exec();
    if (templates.length === 0) return;
    await Reminder.insertMany(
      templates.map((t) => ({ userId, title: t.title, subtitle: t.subtitle, time: t.time, enabled: t.enabled }))
    );
  }
}

export const reminderRepository = new ReminderRepository();
