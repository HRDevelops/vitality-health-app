import { NutritionLog, INutritionLog } from '../models/NutritionLog';

export class NutritionRepository {
  async findByDate(userId: string, logDate: string): Promise<INutritionLog[]> {
    return NutritionLog.find({ userId, logDate }).sort({ consumedAt: 1 }).exec();
  }

  async create(data: Partial<INutritionLog>): Promise<INutritionLog> {
    return NutritionLog.create(data);
  }

  async findById(id: string): Promise<INutritionLog | null> {
    return NutritionLog.findById(id).exec();
  }
}

export const nutritionRepository = new NutritionRepository();
