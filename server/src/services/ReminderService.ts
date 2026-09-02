import { userRepository } from '../repositories/UserRepository';
import { reminderRepository } from '../repositories/ReminderRepository';

export class ReminderService {
  async list() {
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');
    return reminderRepository.findByUser(user.id);
  }

  async toggle(id: string, enabled: boolean) {
    const reminder = await reminderRepository.toggle(id, enabled);
    if (!reminder) throw new Error('Reminder not found');
    return reminder;
  }
}

export const reminderService = new ReminderService();
