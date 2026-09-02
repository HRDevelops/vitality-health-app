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
}

export const userRepository = new UserRepository();
