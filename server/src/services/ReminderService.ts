import { reminderRepository } from '../repositories/ReminderRepository';

export class ReminderService {
  async list(userId: string) {
    return reminderRepository.findByUser(userId);
  }

  async update(id: string, userId: string, updates: { enabled?: boolean; time?: string }) {
    const reminder = await reminderRepository.update(id, userId, updates);
    if (!reminder) throw new Error('Reminder not found');
    return reminder;
  }
}

export const reminderService = new ReminderService();
