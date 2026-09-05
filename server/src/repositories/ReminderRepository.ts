import { Reminder, IReminder } from '../models/Reminder';

export class ReminderRepository {
  async findByUser(userId: string): Promise<IReminder[]> {
    return Reminder.find({ userId }).sort({ time: 1 }).exec();
  }

  async update(id: string, updates: Partial<Pick<IReminder, 'enabled' | 'time'>>): Promise<IReminder | null> {
    return Reminder.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).exec();
  }
}

export const reminderRepository = new ReminderRepository();
