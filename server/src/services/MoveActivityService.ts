import mongoose from 'mongoose';
import { MoveActivity, IMoveActivity, MoveActivityType } from '../models/MoveActivity';
import { User } from '../models/User';

export interface LogMoveActivityDto {
  activityType: MoveActivityType;
  distanceKm: number;
  durationMinutes: number;
  loggedAt?: Date | string;
}

export interface MoveActivityFilter {
  activityType?: MoveActivityType;
  isFlagged?: boolean;
  limit?: number;
}

export interface MoveSummary {
  totalVerifiedDistanceKm: number;
  totalCo2SavingsKg: number;
  walkathonKm: number;
  cyclingKm: number;
  totalActivities: number;
  verifiedActivitiesCount: number;
  flaggedActivitiesCount: number;
  activeStrikes: number;
}

export class MoveActivityService {
  /**
   * Evaluates pace against anti-cheat motorized vehicle thresholds.
   * Walkathon: > 12.0 km/h -> Fraud
   * Cycling: > 45.0 km/h -> Fraud
   */
  public evaluatePace(
    activityType: MoveActivityType,
    distanceKm: number,
    durationMinutes: number
  ): {
    averagePaceKmh: number;
    isFlagged: boolean;
    flagReason?: string;
    co2SavingsKg: number;
  } {
    if (distanceKm <= 0 || durationMinutes <= 0) {
      throw new Error('Distance (km) and duration (minutes) must be positive values');
    }

    const hours = durationMinutes / 60;
    const averagePaceKmh = Number((distanceKm / hours).toFixed(2));

    const threshold = activityType === 'WALKATHON' ? 12.0 : 45.0;
    const isFlagged = averagePaceKmh > threshold;

    if (isFlagged) {
      return {
        averagePaceKmh,
        isFlagged: true,
        flagReason: 'IMPLAUSIBLE_PACE_EXCEEDS_HUMAN_THRESHOLD',
        co2SavingsKg: 0,
      };
    }

    const co2SavingsKg = Number((distanceKm * 0.192).toFixed(3));
    return {
      averagePaceKmh,
      isFlagged: false,
      co2SavingsKg,
    };
  }

  /**
   * Logs a new move activity, applies anti-cheat validation, and increments user strike count if fraudulent.
   */
  public async logActivity(userId: string, data: LogMoveActivityDto): Promise<IMoveActivity> {
    if (!data.activityType || !['WALKATHON', 'CYCLING'].includes(data.activityType)) {
      throw new Error('Invalid activityType. Must be "WALKATHON" or "CYCLING".');
    }

    const distanceKm = Number(data.distanceKm);
    const durationMinutes = Number(data.durationMinutes);

    const evaluation = this.evaluatePace(data.activityType, distanceKm, durationMinutes);

    const doc = await MoveActivity.create({
      userId: new mongoose.Types.ObjectId(userId),
      activityType: data.activityType,
      distanceKm,
      durationMinutes,
      co2SavingsKg: evaluation.co2SavingsKg,
      averagePaceKmh: evaluation.averagePaceKmh,
      isFlagged: evaluation.isFlagged,
      flagReason: evaluation.flagReason,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
    });

    if (evaluation.isFlagged) {
      await User.findByIdAndUpdate(userId, { $inc: { strikeCount: 1 } });
    }

    return doc;
  }

  /**
   * Retrieves list of activities with optional filtering.
   */
  public async getActivities(userId: string, filters: MoveActivityFilter = {}): Promise<IMoveActivity[]> {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };

    if (filters.activityType) {
      query.activityType = filters.activityType;
    }

    if (typeof filters.isFlagged === 'boolean') {
      query.isFlagged = filters.isFlagged;
    }

    const limit = Math.min(Number(filters.limit) || 50, 100);

    return MoveActivity.find(query).sort({ loggedAt: -1 }).limit(limit);
  }

  /**
   * Computes Move summary: verified distance, total CO2 offset, active strikes, and breakdown.
   */
  public async getSummary(userId: string): Promise<MoveSummary> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [user, activities] = await Promise.all([
      User.findById(userObjectId).select('strikeCount'),
      MoveActivity.find({ userId: userObjectId }).sort({ loggedAt: -1 }),
    ]);

    const activeStrikes = user?.strikeCount ?? 0;
    const verifiedActivities = activities.filter((a) => !a.isFlagged);
    const flaggedActivities = activities.filter((a) => a.isFlagged);

    const totalVerifiedDistanceKm = Number(
      verifiedActivities.reduce((sum, a) => sum + (a.distanceKm || 0), 0).toFixed(2)
    );

    const totalCo2SavingsKg = Number(
      verifiedActivities.reduce((sum, a) => sum + (a.co2SavingsKg || 0), 0).toFixed(3)
    );

    const walkathonKm = Number(
      verifiedActivities
        .filter((a) => a.activityType === 'WALKATHON')
        .reduce((sum, a) => sum + (a.distanceKm || 0), 0)
        .toFixed(2)
    );

    const cyclingKm = Number(
      verifiedActivities
        .filter((a) => a.activityType === 'CYCLING')
        .reduce((sum, a) => sum + (a.distanceKm || 0), 0)
        .toFixed(2)
    );

    return {
      totalVerifiedDistanceKm,
      totalCo2SavingsKg,
      walkathonKm,
      cyclingKm,
      totalActivities: activities.length,
      verifiedActivitiesCount: verifiedActivities.length,
      flaggedActivitiesCount: flaggedActivities.length,
      activeStrikes,
    };
  }
}

export const moveActivityService = new MoveActivityService();
