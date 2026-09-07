import { userRepository } from '../repositories/UserRepository';

export class UserService {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateWeight(userId: string, weightKg: number) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return userRepository.updateWeight(user.id, weightKg);
  }

  async updateProfile(userId: string, data: { name?: string; heightCm?: number; targetWeightKg?: number }) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return userRepository.updateProfile(user.id, data);
  }

  async setStreakFreezeEquipped(userId: string, equipped: boolean) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    if (equipped && !user.streakFreezeAvailable) throw new Error('No Streak Freeze available to equip');
    return userRepository.setStreakFreezeEquipped(user.id, equipped);
  }
}

export const userService = new UserService();
