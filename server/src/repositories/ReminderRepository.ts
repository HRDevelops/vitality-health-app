import { Reminder, IReminder } from '../models/Reminder';

export class ReminderRepository {
  async findByUser(userId: string): Promise<IReminder[]> {
    return Reminder.find({ userId }).sort({ time: 1 }).exec();
  }

  async toggle(id: string, enabled: boolean): Promise<IReminder | null> {
    return Reminder.findByIdAndUpdate(id, { enabled }, { new: true }).exec();
  }
}

export const reminderRepository = new ReminderRepository();
