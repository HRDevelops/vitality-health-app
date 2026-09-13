import mongoose from 'mongoose';
import { HealthMetric, IHealthMetric, HealthMetricType, HealthMetricUiToken, GlucoseUnit } from '../models/HealthMetric';
import { AchievementService } from './AchievementService';

export interface CreateHealthMetricDto {
  type: HealthMetricType;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  glucoseValue?: number;
  glucoseUnit?: GlucoseUnit;
  isFasting?: boolean;
  notes?: string;
  loggedAt?: Date | string;
}

export interface HealthMetricHistoryFilter {
  type?: HealthMetricType;
  limit?: number;
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface HealthMetricSummary {
  latestBp: IHealthMetric | null;
  latestGlucose: IHealthMetric | null;
  averages: {
    avgSystolic: number | null;
    avgDiastolic: number | null;
    avgPulse: number | null;
    avgGlucose: number | null;
  };
  categoryDistributions: {
    bloodPressure: Record<string, number>;
    bloodGlucose: Record<string, number>;
  };
  highestRiskFlag: HealthMetricUiToken;
  totalReadings: number;
}

export class HealthMetricService {
  /**
   * Evaluates BP according to AHA/ACC 2017 Guidelines.
   * Higher risk zone takes precedence.
   */
  public evaluateBloodPressure(systolic: number, diastolic: number): {
    category: string;
    uiToken: HealthMetricUiToken;
    isCriticalAlert: boolean;
  } {
    if (systolic > 180 || diastolic > 120) {
      return {
        category: 'Hypertensive Crisis',
        uiToken: 'Clay',
        isCriticalAlert: true,
      };
    }

    if (systolic >= 140 || diastolic >= 90) {
      return {
        category: 'High — Stage 2',
        uiToken: 'Clay',
        isCriticalAlert: false,
      };
    }

    if (systolic >= 130 || diastolic >= 80) {
      return {
        category: 'High — Stage 1',
        uiToken: 'Saffron',
        isCriticalAlert: false,
      };
    }

    if (systolic >= 120 && diastolic < 80) {
      return {
        category: 'Elevated',
        uiToken: 'Saffron',
        isCriticalAlert: false,
      };
    }

    return {
      category: 'Normal',
      uiToken: 'Fern',
      isCriticalAlert: false,
    };
  }

  /**
   * Evaluates Glucose according to ADA Guidelines.
   * Internal storage is always mg/dL.
   */
  public evaluateBloodGlucose(
    valueMgDl: number,
    isFasting: boolean
  ): {
    category: string;
    uiToken: HealthMetricUiToken;
    isCriticalAlert: boolean;
  } {
    if (valueMgDl < 70) {
      return {
        category: 'Hypoglycemia',
        uiToken: 'Clay',
        isCriticalAlert: false,
      };
    }

    if (isFasting) {
      if (valueMgDl >= 126) {
        return {
          category: 'Diabetes',
          uiToken: 'Clay',
          isCriticalAlert: false,
        };
      }
      if (valueMgDl >= 100) {
        return {
          category: 'Prediabetes',
          uiToken: 'Saffron',
          isCriticalAlert: false,
        };
      }
      return {
        category: 'Normal',
        uiToken: 'Fern',
        isCriticalAlert: false,
      };
    } else {
      // Random / Post-Prandial
      if (valueMgDl >= 200) {
        return {
          category: 'Diabetes',
          uiToken: 'Clay',
          isCriticalAlert: false,
        };
      }
      if (valueMgDl >= 140) {
        return {
          category: 'Prediabetes',
          uiToken: 'Saffron',
          isCriticalAlert: false,
        };
      }
      return {
        category: 'Normal',
        uiToken: 'Fern',
        isCriticalAlert: false,
      };
    }
  }

  /**
   * Creates a new health metric reading with automated clinical evaluation.
   */
  public async createReading(userId: string, data: CreateHealthMetricDto): Promise<IHealthMetric> {
    if (!data.type || !['blood_pressure', 'blood_glucose'].includes(data.type)) {
      throw new Error('Valid metric type ("blood_pressure" | "blood_glucose") is required');
    }

    let category = '';
    let uiToken: HealthMetricUiToken = 'Fern';
    let isCriticalAlert = false;
    let storedGlucoseValue: number | undefined;

    if (data.type === 'blood_pressure') {
      const systolic = Number(data.systolic);
      const diastolic = Number(data.diastolic);

      if (isNaN(systolic) || isNaN(diastolic) || systolic <= 0 || diastolic <= 0) {
        throw new Error('Valid systolic and diastolic values are required for blood pressure');
      }

      const evaluation = this.evaluateBloodPressure(systolic, diastolic);
      category = evaluation.category;
      uiToken = evaluation.uiToken;
      isCriticalAlert = evaluation.isCriticalAlert;
    } else if (data.type === 'blood_glucose') {
      const rawValue = Number(data.glucoseValue);
      if (isNaN(rawValue) || rawValue <= 0) {
        throw new Error('Valid glucoseValue is required for blood glucose');
      }

      const unit = data.glucoseUnit || 'MG_DL';
      // Convert mmol/L to mg/dL if needed: mg/dL = mmol/L * 18.0182
      storedGlucoseValue = unit === 'MMOL_L' ? Math.round(rawValue * 18.0182 * 10) / 10 : rawValue;

      const isFasting = Boolean(data.isFasting);
      const evaluation = this.evaluateBloodGlucose(storedGlucoseValue, isFasting);
      category = evaluation.category;
      uiToken = evaluation.uiToken;
      isCriticalAlert = evaluation.isCriticalAlert;
    }

    const doc = await HealthMetric.create({
      userId: new mongoose.Types.ObjectId(userId),
      type: data.type,
      systolic: data.systolic !== undefined ? Number(data.systolic) : undefined,
      diastolic: data.diastolic !== undefined ? Number(data.diastolic) : undefined,
      pulse: data.pulse !== undefined && data.pulse !== null && data.pulse !== ('' as any) ? Number(data.pulse) : undefined,
      glucoseValue: storedGlucoseValue,
      glucoseUnit: data.glucoseUnit || 'MG_DL',
      isFasting: Boolean(data.isFasting),
      category,
      uiToken,
      isCriticalAlert,
      notes: data.notes ? String(data.notes).slice(0, 280) : undefined,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
    });

    if (data.type === 'blood_pressure') {
      await AchievementService.checkAndUnlock(userId, {
        type: 'CLINICAL_BP_LOG',
        metadata: { uiToken, systolic: data.systolic, diastolic: data.diastolic },
      });
    } else if (data.type === 'blood_glucose') {
      await AchievementService.checkAndUnlock(userId, {
        type: 'CLINICAL_GLUCOSE_LOG',
        metadata: { isFasting: Boolean(data.isFasting), uiToken, glucoseValue: storedGlucoseValue },
      });
    }

    return doc;
  }

  /**
   * Retrieves user history with optional filtering.
   */
  public async getHistory(userId: string, filters: HealthMetricHistoryFilter = {}): Promise<IHealthMetric[]> {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      query.loggedAt = {};
      if (filters.startDate) query.loggedAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.loggedAt.$lte = new Date(filters.endDate);
    }

    const limit = Math.min(Number(filters.limit) || 50, 100);

    return HealthMetric.find(query).sort({ loggedAt: -1 }).limit(limit);
  }

  /**
   * Computes a clinical summary for the user (latest readings, averages, distribution, highest risk flag).
   */
  public async getSummary(userId: string): Promise<HealthMetricSummary> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [latestBp, latestGlucose, recentMetrics, totalReadings] = await Promise.all([
      HealthMetric.findOne({ userId: userObjectId, type: 'blood_pressure' }).sort({ loggedAt: -1 }),
      HealthMetric.findOne({ userId: userObjectId, type: 'blood_glucose' }).sort({ loggedAt: -1 }),
      HealthMetric.find({ userId: userObjectId }).sort({ loggedAt: -1 }).limit(100),
      HealthMetric.countDocuments({ userId: userObjectId }),
    ]);

    // Compute averages from recent metrics
    const bpMetrics = recentMetrics.filter((m) => m.type === 'blood_pressure');
    const glucoseMetrics = recentMetrics.filter((m) => m.type === 'blood_glucose');

    const avgSystolic = bpMetrics.length
      ? Math.round(bpMetrics.reduce((acc, cur) => acc + (cur.systolic || 0), 0) / bpMetrics.length)
      : null;

    const avgDiastolic = bpMetrics.length
      ? Math.round(bpMetrics.reduce((acc, cur) => acc + (cur.diastolic || 0), 0) / bpMetrics.length)
      : null;

    const pulseEntries = bpMetrics.filter((m) => typeof m.pulse === 'number' && m.pulse > 0);
    const avgPulse = pulseEntries.length
      ? Math.round(pulseEntries.reduce((acc, cur) => acc + (cur.pulse || 0), 0) / pulseEntries.length)
      : null;

    const avgGlucose = glucoseMetrics.length
      ? Math.round(
          (glucoseMetrics.reduce((acc, cur) => acc + (cur.glucoseValue || 0), 0) / glucoseMetrics.length) * 10
        ) / 10
      : null;

    // Distributions
    const bpDist: Record<string, number> = {};
    for (const m of bpMetrics) {
      bpDist[m.category] = (bpDist[m.category] || 0) + 1;
    }

    const glucoseDist: Record<string, number> = {};
    for (const m of glucoseMetrics) {
      glucoseDist[m.category] = (glucoseDist[m.category] || 0) + 1;
    }

    // Determine highest risk level from recent readings
    let highestRiskFlag: HealthMetricUiToken = 'Fern';
    const hasClay = recentMetrics.some((m) => m.uiToken === 'Clay');
    const hasSaffron = recentMetrics.some((m) => m.uiToken === 'Saffron');

    if (hasClay) {
      highestRiskFlag = 'Clay';
    } else if (hasSaffron) {
      highestRiskFlag = 'Saffron';
    }

    return {
      latestBp,
      latestGlucose,
      averages: {
        avgSystolic,
        avgDiastolic,
        avgPulse,
        avgGlucose,
      },
      categoryDistributions: {
        bloodPressure: bpDist,
        bloodGlucose: glucoseDist,
      },
      highestRiskFlag,
      totalReadings,
    };
  }
}

export const healthMetricService = new HealthMetricService();
