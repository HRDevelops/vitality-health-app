import { ActivityLog, IActivityLog } from '../models/ActivityLog';
import { Types } from 'mongoose';

export class ActivityRepository {
  async findByDate(userId: string, logDate: string): Promise<IActivityLog | null> {
    return ActivityLog.findOne({ userId, logDate }).exec();
  }

  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<IActivityLog[]> {
    return ActivityLog.find({
      userId,
      logDate: { $gte: startDate, $lte: endDate },
    })
      .sort({ logDate: 1 })
      .exec();
  }

  async upsertForDate(userId: string, logDate: string): Promise<IActivityLog> {
    const doc = await ActivityLog.findOneAndUpdate(
      { userId, logDate },
      { $setOnInsert: { userId: new Types.ObjectId(userId), logDate } },
      { upsert: true, new: true }
    ).exec();
    return doc as IActivityLog;
  }

  async incrementFields(
    userId: string,
    logDate: string,
    increments: Partial<Pick<IActivityLog, 'steps' | 'caloriesBurned' | 'distanceKm' | 'activeMinutes' | 'waterMl'>>
  ): Promise<IActivityLog> {
    const doc = await ActivityLog.findOneAndUpdate(
      { userId, logDate },
      { $inc: increments, $setOnInsert: { userId: new Types.ObjectId(userId), logDate } },
      { upsert: true, new: true }
    ).exec();
    return doc as IActivityLog;
  }

  async create(data: Partial<IActivityLog>): Promise<IActivityLog> {
    return ActivityLog.create(data);
  }

  async addWorkoutEntry(
    userId: string,
    logDate: string,
    entry: { title: string; caloriesBurned: number; activeMinutes: number; distanceKm: number },
    increments: Partial<Pick<IActivityLog, 'steps' | 'caloriesBurned' | 'distanceKm' | 'activeMinutes'>>
  ): Promise<IActivityLog> {
    const doc = await ActivityLog.findOneAndUpdate(
      { userId, logDate },
      {
        $inc: increments,
        $push: { workouts: { ...entry, loggedAt: new Date() } },
        $setOnInsert: { userId: new Types.ObjectId(userId), logDate },
      },
      { upsert: true, new: true }
    ).exec();
    return doc as IActivityLog;
  }
}

export const activityRepository = new ActivityRepository();
