import { Types } from 'mongoose';
import { UserAchievement, IUserAchievement } from '../models/UserAchievement';
import { ACHIEVEMENT_CATALOG, AchievementDefinition } from '../data/achievementCatalog';
import { MoveActivity } from '../models/MoveActivity';
import { HealthMetric } from '../models/HealthMetric';
import { CareCircleLink } from '../models/CareCircleLink';
import { ProductScan } from '../models/ProductScan';
import { User } from '../models/User';

export interface EvaluatedAchievement extends AchievementDefinition {
  isUnlocked: boolean;
  unlockedAt: Date | null;
  progressPercentage: number;
}

export interface AchievementSummaryResponse {
  totalUnlocked: number;
  totalAvailable: number;
  unlockedRatio: number;
  byRarity: Record<
    string,
    {
      total: number;
      unlocked: number;
    }
  >;
  achievements: EvaluatedAchievement[];
}

const KEY_ALIASES: Record<string, string> = {
  FIRST_CYCLING: 'FIRST_MOVE_CYCLE',
  FIRST_SPIN: 'FIRST_MOVE_CYCLE',
  FIRST_PEDAL: 'FIRST_MOVE_CYCLE',
  FIRST_WALKATHON: 'FIRST_MOVE_WALK',
  FIRST_STRIDE: 'FIRST_MOVE_WALK',
  FAMILY_GUARDIAN: 'LINK_CARE_CIRCLE',
  CARE_CIRCLE_GUARDIAN: 'LINK_CARE_CIRCLE',
};

export class AchievementService {
  /**
   * Evaluates an incoming system event and unlocks matching achievements atomically.
   */
  async checkAndUnlock(
    userId: string | Types.ObjectId,
    event: {
      type: string;
      value?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<IUserAchievement[]> {
    const userObjectId = new Types.ObjectId(userId.toString());
    const newlyUnlocked: IUserAchievement[] = [];
    const keysToUnlock: string[] = [];

    switch (event.type) {
      case 'CLINICAL_BP_LOG':
      case 'blood_pressure':
      case 'BP':
        keysToUnlock.push('FIRST_BP_LOG');
        if (event.metadata?.uiToken === 'Fern') {
          keysToUnlock.push('OPTIMAL_BP_READING');
        }
        break;

      case 'CLINICAL_GLUCOSE_LOG':
      case 'blood_glucose':
      case 'GLUCOSE':
        keysToUnlock.push('FIRST_GLUCOSE_LOG');
        if (event.metadata?.isFasting) {
          keysToUnlock.push('FIRST_FASTING_GLUCOSE');
          if (event.metadata?.uiToken === 'Fern') {
            keysToUnlock.push('FASTING_GLUCOSE_NORMAL');
          }
        }
        break;

      case 'MOVE_WALK':
      case 'MOVE_WALKATHON':
      case 'WALKATHON':
        keysToUnlock.push('FIRST_MOVE_WALK');
        if (event.value && event.value >= 1.0) keysToUnlock.push('WALK_1KM');
        if (event.value && event.value >= 5.0) keysToUnlock.push('WALK_5KM');
        if (event.value && event.value >= 10.0) keysToUnlock.push('WALK_10KM_SINGLE');
        if (event.value && event.value >= 20.0) keysToUnlock.push('WALK_20KM_SINGLE');
        break;

      case 'MOVE_CYCLE':
      case 'MOVE_CYCLING':
      case 'CYCLING':
      case 'CYCLE':
        keysToUnlock.push('FIRST_MOVE_CYCLE');
        if (event.value && event.value >= 3.0) keysToUnlock.push('CYCLE_3KM');
        if (event.value && event.value >= 10.0) keysToUnlock.push('CYCLE_10KM');
        if (event.value && event.value >= 25.0) keysToUnlock.push('CYCLE_25KM_SINGLE');
        if (event.value && event.value >= 50.0) keysToUnlock.push('CYCLE_50KM_SINGLE');
        break;

      case 'CO2_OFFSET':
        if (event.value && event.value >= 0.5) keysToUnlock.push('CO2_FIRST_OFFSET');
        if (event.value && event.value >= 2.0) keysToUnlock.push('CO2_SAVER_2KG');
        if (event.value && event.value >= 5.0) keysToUnlock.push('CO2_SAVER_5KG');
        if (event.value && event.value >= 10.0) keysToUnlock.push('CO2_SAVER_10KG');
        if (event.value && event.value >= 25.0) keysToUnlock.push('CO2_SAVER_25KG');
        break;

      case 'NUTRITION_MEAL_SCAN':
        keysToUnlock.push('FIRST_MEAL_SCAN');
        if (event.metadata?.sodiumMg !== undefined && event.metadata.sodiumMg <= 500) {
          keysToUnlock.push('OPTIMAL_DASH_MEAL');
        }
        if (event.metadata?.cookingMode) {
          keysToUnlock.push('COOKING_MODE_USED');
        }
        break;

      case 'NUTRITION_PRODUCT_SCAN':
        keysToUnlock.push('FIRST_PRODUCT_SCAN');
        if (event.metadata?.ocrRawText) {
          keysToUnlock.push('OCR_LABEL_EXTRACTED');
        }
        if (event.metadata?.labVerifiedScore !== undefined && event.metadata.labVerifiedScore >= 9.0) {
          keysToUnlock.push('LAB_SCORE_HIGH');
        }
        break;

      case 'COMMUNITY_JOIN_TEAM':
        keysToUnlock.push('JOIN_CAMPUS_TEAM');
        break;

      case 'COMMUNITY_CARE_CIRCLE_LINK':
        keysToUnlock.push('LINK_CARE_CIRCLE');
        break;

      case 'ONBOARDING_COMPLETED':
        keysToUnlock.push('COMPLETE_ONBOARDING');
        break;

      case 'CLAIM_GUEST':
        keysToUnlock.push('CLAIM_GUEST_ACCOUNT');
        break;

      case 'DEMO_MODE_TOGGLED':
        keysToUnlock.push('EXPLORE_DEMO_SANDBOX');
        break;

      case 'APP_RATED':
        keysToUnlock.push('RATE_THE_APP');
        break;

      default:
        break;
    }

    for (const key of keysToUnlock) {
      const def = ACHIEVEMENT_CATALOG.find((a) => a.key === key);
      if (!def) continue;

      try {
        const doc = await UserAchievement.findOneAndUpdate(
          { userId: userObjectId, achievementId: def.id },
          {
            $setOnInsert: {
              userId: userObjectId,
              achievementId: def.id,
              key: def.key,
              title: def.title,
              description: def.description,
              category: def.category,
              rarity: def.rarity,
              iconName: def.iconName,
              unlockedAt: new Date(),
            },
          },
          { upsert: true, new: true, rawResult: true }
        );

        // If newly created (upserted)
        if (doc && (doc as any).lastErrorObject && !(doc as any).lastErrorObject.updatedExisting) {
          newlyUnlocked.push((doc as any).value);
        }
      } catch (err) {
        // Compound index unique violation is safe to ignore
      }
    }

    return newlyUnlocked;
  }

  /**
   * Force unlocks a specific achievement by ID or Key.
   */
  async unlock(userId: string | Types.ObjectId, idOrKey: number | string): Promise<IUserAchievement | null> {
    const userObjectId = new Types.ObjectId(userId.toString());
    const resolved = typeof idOrKey === 'string' ? (KEY_ALIASES[idOrKey] || idOrKey) : idOrKey;
    const def =
      typeof resolved === 'number'
        ? ACHIEVEMENT_CATALOG.find((a) => a.id === resolved)
        : ACHIEVEMENT_CATALOG.find((a) => a.key === resolved);

    if (!def) return null;

    try {
      const existing = await UserAchievement.findOne({
        userId: userObjectId,
        achievementId: def.id,
      });
      if (existing) return existing;

      return await UserAchievement.create({
        userId: userObjectId,
        achievementId: def.id,
        key: def.key,
        title: def.title,
        description: def.description,
        category: def.category,
        rarity: def.rarity,
        iconName: def.iconName,
        unlockedAt: new Date(),
      });
    } catch {
      return null;
    }
  }

  /**
   * Retroactively synchronizes and reconciles all earned achievements based on historical data.
   */
  async syncUserAchievements(userId: string | Types.ObjectId): Promise<void> {
    try {
      const userObjectId = new Types.ObjectId(userId.toString());

      // 1. Move Activities (verified only)
      // Check verified CYCLING activities
      const cyclingActivity = await MoveActivity.findOne({
        userId: userObjectId,
        activityType: { $in: ['CYCLING', 'CYCLE'] },
        isFlagged: { $ne: true },
      });

      if (cyclingActivity) {
        // Badge #4: "First Spin" (key: FIRST_MOVE_CYCLE / FIRST_CYCLING / FIRST_SPIN)
        await this.unlock(userObjectId, 4);
        await this.unlock(userObjectId, 'FIRST_MOVE_CYCLE');
      }

      // Check verified WALKATHON activities
      const walkathonActivity = await MoveActivity.findOne({
        userId: userObjectId,
        activityType: { $in: ['WALKATHON', 'WALK'] },
        isFlagged: { $ne: true },
      });

      if (walkathonActivity) {
        // Badge #3: "First Stride" (key: FIRST_MOVE_WALK / FIRST_WALKATHON)
        await this.unlock(userObjectId, 3);
        await this.unlock(userObjectId, 'FIRST_MOVE_WALK');
      }

      // Fetch all verified activities for distance & milestone calculations
      const verifiedActivities = await MoveActivity.find({
        userId: userObjectId,
        isFlagged: { $ne: true },
      })
        .select('activityType distanceKm co2SavingsKg')
        .lean();

      let totalKm = 0;
      let totalCo2 = 0;

      for (const act of verifiedActivities) {
        const km = Number(act.distanceKm) || 0;
        totalKm += km;
        totalCo2 += Number(act.co2SavingsKg) || (km * 0.192);

        const actType = (act.activityType || '').toUpperCase();
        if (actType === 'CYCLING' || actType === 'CYCLE') {
          if (km >= 3.0) await this.unlock(userObjectId, 'CYCLE_3KM');
          if (km >= 10.0) await this.unlock(userObjectId, 'CYCLE_10KM');
          if (km >= 25.0) await this.unlock(userObjectId, 'CYCLE_25KM_SINGLE');
          if (km >= 50.0) await this.unlock(userObjectId, 'CYCLE_50KM_SINGLE');
          if (km >= 100.0) await this.unlock(userObjectId, 'CYCLE_CENTURY_100KM');
        } else if (actType === 'WALKATHON' || actType === 'WALK') {
          if (km >= 1.0) await this.unlock(userObjectId, 'WALK_1KM');
          if (km >= 5.0) await this.unlock(userObjectId, 'WALK_5KM');
          if (km >= 10.0) await this.unlock(userObjectId, 'WALK_10KM_SINGLE');
          if (km >= 20.0) await this.unlock(userObjectId, 'WALK_20KM_SINGLE');
        }
      }

      // Distance milestones: Sum verified km; if >= 10km, 25km, 50km, unlock corresponding milestone badges
      if (totalKm >= 10) {
        await this.unlock(userObjectId, 'CYCLE_10KM');
        await this.unlock(userObjectId, 'WALK_10KM_SINGLE');
        await this.unlock(userObjectId, 'WALK_5KM');
        await this.unlock(userObjectId, 'CYCLE_3KM');
        await this.unlock(userObjectId, 'WALK_1KM');
      }
      if (totalKm >= 15) {
        await this.unlock(userObjectId, 'MOVE_15KM_TOTAL');
      }
      if (totalKm >= 25) {
        await this.unlock(userObjectId, 'CYCLE_25KM_SINGLE');
      }
      if (totalKm >= 30) {
        await this.unlock(userObjectId, 'MOVE_30KM_TOTAL');
      }
      if (totalKm >= 50) {
        await this.unlock(userObjectId, 'MOVE_50KM_TOTAL');
        await this.unlock(userObjectId, 'CYCLE_50KM_SINGLE');
        await this.unlock(userObjectId, 'CAMPUS_HERO_50KM');
      }
      if (totalKm >= 100) {
        await this.unlock(userObjectId, 'CENTURION_100KM');
        await this.unlock(userObjectId, 'CYCLE_CENTURY_100KM');
      }
      if (totalKm >= 500) {
        await this.unlock(userObjectId, 'GRAND_TOUR_500KM');
      }

      // Carbon offset milestones
      if (totalCo2 >= 0.5) await this.unlock(userObjectId, 'CO2_FIRST_OFFSET');
      if (totalCo2 >= 2.0) await this.unlock(userObjectId, 'CO2_SAVER_2KG');
      if (totalCo2 >= 5.0) await this.unlock(userObjectId, 'CO2_SAVER_5KG');
      if (totalCo2 >= 10.0) await this.unlock(userObjectId, 'CO2_SAVER_10KG');
      if (totalCo2 >= 25.0) await this.unlock(userObjectId, 'CO2_SAVER_25KG');

      // 2. Health Metrics
      const bpCount = await HealthMetric.countDocuments({
        userId: userObjectId,
        type: 'blood_pressure',
      });
      if (bpCount > 0) {
        // badge #1 (FIRST_BP_LOG)
        await this.unlock(userObjectId, 1);
        await this.unlock(userObjectId, 'FIRST_BP_LOG');
        const hasOptimalBp = await HealthMetric.exists({
          userId: userObjectId,
          type: 'blood_pressure',
          uiToken: 'Fern',
        });
        if (hasOptimalBp) {
          await this.unlock(userObjectId, 'OPTIMAL_BP_READING');
        }
      }

      const glucoseCount = await HealthMetric.countDocuments({
        userId: userObjectId,
        type: 'blood_glucose',
      });
      if (glucoseCount > 0) {
        // badge #2 (FIRST_GLUCOSE_LOG)
        await this.unlock(userObjectId, 2);
        await this.unlock(userObjectId, 'FIRST_GLUCOSE_LOG');
        const fastingReading = await HealthMetric.findOne({
          userId: userObjectId,
          type: 'blood_glucose',
          isFasting: true,
        }).lean();
        if (fastingReading) {
          await this.unlock(userObjectId, 'FIRST_FASTING_GLUCOSE');
          if (fastingReading.uiToken === 'Fern') {
            await this.unlock(userObjectId, 'FASTING_GLUCOSE_NORMAL');
          }
        }
      }

      // 3. Care Circle Links
      const careLinksCount = await CareCircleLink.countDocuments({
        $or: [{ observerId: userObjectId }, { subjectId: userObjectId }],
      });
      if (careLinksCount > 0) {
        // Unlock badge #8 ("Family Guardian") & #10 ("Diaspora Connection")
        await this.unlock(userObjectId, 8);
        await this.unlock(userObjectId, 10);
        await this.unlock(userObjectId, 'LINK_CARE_CIRCLE');
        await this.unlock(userObjectId, 'FAMILY_GUARDIAN');
        if (careLinksCount >= 2) await this.unlock(userObjectId, 'CARE_CIRCLE_PAIR_2');
        if (careLinksCount >= 3) await this.unlock(userObjectId, 'CARE_CIRCLE_TRIO');
      }

      // 4. User Profile Milestones
      const user = await User.findById(userObjectId)
        .select('onboardingCompleted teamId hasRatedApp accountStatus isDemo currentWeightKg')
        .lean();
      if (user) {
        if (user.onboardingCompleted) await this.unlock(userObjectId, 'COMPLETE_ONBOARDING');
        if (user.teamId) await this.unlock(userObjectId, 'JOIN_CAMPUS_TEAM');
        if (user.isDemo) await this.unlock(userObjectId, 'EXPLORE_DEMO_SANDBOX');
        if (user.hasRatedApp) await this.unlock(userObjectId, 'RATE_THE_APP');
        if (user.accountStatus === 'ACTIVE_USER') await this.unlock(userObjectId, 'CLAIM_GUEST_ACCOUNT');
        if (user.currentWeightKg && user.currentWeightKg > 0) await this.unlock(userObjectId, 8);
      }

      // 5. Product and Meal Scans
      const mealScans = await ProductScan.countDocuments({ userId: userObjectId, scanType: 'HEART_PLATE' });
      if (mealScans > 0) await this.unlock(userObjectId, 'FIRST_MEAL_SCAN');

      const prodScans = await ProductScan.countDocuments({ userId: userObjectId, scanType: 'PRODUCT' });
      if (prodScans > 0) await this.unlock(userObjectId, 'FIRST_PRODUCT_SCAN');
    } catch (err) {
      console.error('Error in syncUserAchievements:', err);
    }
  }

  /**
   * Retrieves full catalog with user's unlock statuses and progress breakdown.
   */
  async getUserAchievements(userId: string | Types.ObjectId): Promise<AchievementSummaryResponse> {
    const userObjectId = new Types.ObjectId(userId.toString());

    // Automatically backfill and reconcile achievements before evaluating
    await this.syncUserAchievements(userObjectId);

    const userUnlocks = await UserAchievement.find({
      $or: [{ userId: userObjectId }, { userId: userId.toString() }],
    }).lean();
    const unlockMap = new Map<number, { unlockedAt: Date }>();
    userUnlocks.forEach((u) => {
      unlockMap.set(u.achievementId, { unlockedAt: u.unlockedAt });
    });

    const byRarity: Record<string, { total: number; unlocked: number }> = {
      COMMON: { total: 0, unlocked: 0 },
      UNCOMMON: { total: 0, unlocked: 0 },
      RARE: { total: 0, unlocked: 0 },
      EPIC: { total: 0, unlocked: 0 },
      LEGENDARY: { total: 0, unlocked: 0 },
      MYTHIC: { total: 0, unlocked: 0 },
    };

    const achievements: EvaluatedAchievement[] = ACHIEVEMENT_CATALOG.map((def) => {
      const isUnlocked = unlockMap.has(def.id);
      const unlockedAt = isUnlocked ? unlockMap.get(def.id)!.unlockedAt : null;

      byRarity[def.rarity].total += 1;
      if (isUnlocked) {
        byRarity[def.rarity].unlocked += 1;
      }

      return {
        ...def,
        isUnlocked,
        unlockedAt,
        progressPercentage: isUnlocked ? 100 : 0,
      };
    });

    const totalUnlocked = userUnlocks.length;
    const totalAvailable = ACHIEVEMENT_CATALOG.length;

    return {
      totalUnlocked,
      totalAvailable,
      unlockedRatio: totalAvailable > 0 ? Number((totalUnlocked / totalAvailable).toFixed(2)) : 0,
      byRarity,
      achievements,
    };
  }

  // Static helper wrappers so callers can invoke either AchievementService or achievementService
  static checkAndUnlock(
    userId: string | Types.ObjectId,
    event: {
      type: string;
      value?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<IUserAchievement[]> {
    return achievementService.checkAndUnlock(userId, event);
  }

  static syncUserAchievements(userId: string | Types.ObjectId): Promise<void> {
    return achievementService.syncUserAchievements(userId);
  }

  static unlock(userId: string | Types.ObjectId, idOrKey: number | string): Promise<IUserAchievement | null> {
    return achievementService.unlock(userId, idOrKey);
  }

  static getUserAchievements(userId: string | Types.ObjectId): Promise<AchievementSummaryResponse> {
    return achievementService.getUserAchievements(userId);
  }
}

export const achievementService = new AchievementService();
