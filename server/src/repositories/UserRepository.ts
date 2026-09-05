import { User, IUser } from '../models/User';

export class UserRepository {
  async findFirst(): Promise<IUser | null> {
    return User.findOne().exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  async updateWeight(id: string, weightKg: number): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { currentWeightKg: weightKg }, { new: true }).exec();
  }

  async updateProfile(id: string, data: Partial<Pick<IUser, 'name' | 'heightCm' | 'targetWeightKg'>>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async recordPodcastListen(id: string, streakCount: number, listenDate: string, consumeFreeze = false): Promise<IUser | null> {
    const setFields: Record<string, unknown> = { podcastStreakCount: streakCount, lastListenDate: listenDate };
    if (consumeFreeze) {
      setFields.streakFreezeAvailable = false;
      setFields.streakFreezeEquipped = false;
    }
    return User.findByIdAndUpdate(
      id,
      { $inc: { podcastSessionsCompleted: 1 }, $set: setFields },
      { new: true }
    ).exec();
  }

  async setStreakFreezeEquipped(id: string, equipped: boolean): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { streakFreezeEquipped: equipped }, { new: true }).exec();
  }
}

export const userRepository = new UserRepository();
