import { userRepository } from '../repositories/UserRepository';

export class UserService {
  async getProfile() {
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');
    return user;
  }

  async updateWeight(weightKg: number) {
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');
    return userRepository.updateWeight(user.id, weightKg);
  }

  async updateProfile(data: { name?: string; heightCm?: number; targetWeightKg?: number }) {
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');
    return userRepository.updateProfile(user.id, data);
  }

  async setStreakFreezeEquipped(equipped: boolean) {
    const user = await userRepository.findFirst();
    if (!user) throw new Error('No user found. Please run the seed script.');
    if (equipped && !user.streakFreezeAvailable) throw new Error('No Streak Freeze available to equip');
    return userRepository.setStreakFreezeEquipped(user.id, equipped);
  }
}

export const userService = new UserService();
