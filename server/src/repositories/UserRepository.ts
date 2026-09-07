import { User, IUser } from '../models/User';

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }

  async createUser(data: { name: string; email: string; passwordHash: string; avatarUrl: string }): Promise<IUser> {
    return User.create(data);
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  async updateWeight(id: string, weightKg: number): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { currentWeightKg: weightKg }, { new: true }).exec();
  }

  async updateProfile(
    id: string,
    data: Partial<Pick<IUser, 'name' | 'heightCm' | 'targetWeightKg' | 'avatarUrl' | 'stepGoal' | 'waterGoal' | 'calorieGoal'>> & {
      macros?: Partial<{ protein: number; carbs: number; fat: number }>;
    }
  ): Promise<IUser | null> {
    const { macros, ...rest } = data;
    const update: Record<string, unknown> = { ...rest };
    if (macros) {
      for (const [key, value] of Object.entries(macros)) {
        if (value !== undefined) update[`macros.${key}`] = value;
      }
    }
    return User.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
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

  async setResetToken(id: string, token: string, expires: Date): Promise<void> {
    await User.findByIdAndUpdate(id, { resetPasswordToken: token, resetPasswordExpires: expires }).exec();
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    return User.findOne({ resetPasswordToken: token }).exec();
  }

  async resetPassword(id: string, passwordHash: string): Promise<void> {
    await User.findByIdAndUpdate(id, { passwordHash, resetPasswordToken: null, resetPasswordExpires: null }).exec();
  }
}

export const userRepository = new UserRepository();
