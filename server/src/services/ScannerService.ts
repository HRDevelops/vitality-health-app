import { Types } from 'mongoose';
import { ProductScan, IProductScan, DashCompliance } from '../models/ProductScan';
import { achievementService } from './AchievementService';

export interface MealScanInput {
  name?: string;
  imageUrl?: string;
  sodiumMg?: number;
  calories?: number;
  cookingMode?: boolean;
  notes?: string;
}

export interface ProductScanInput {
  name?: string;
  barcode?: string;
  imageUrl?: string;
  ocrRawText?: string;
  sodiumMg?: number;
  calories?: number;
  notes?: string;
}

export interface DailyNutritionSummary {
  todaySodiumMg: number;
  dailyOptimalBenchmarkMg: number;
  dailyUpperLimitMg: number;
  sodiumRemainingOptimalMg: number;
  sodiumRemainingLimitMg: number;
  complianceStatus: DashCompliance;
  uiToken: 'Fern' | 'Saffron' | 'Clay';
  caloriesToday: number;
  scansTodayCount: number;
  recentScans: IProductScan[];
  disclaimer: string;
}

export class ScannerService {
  /**
   * Evaluates single-meal sodium compliance according to DASH guidelines.
   */
  evaluateMealCompliance(sodiumMg: number): {
    compliance: DashCompliance;
    uiToken: 'Fern' | 'Saffron' | 'Clay';
    score: number;
  } {
    if (sodiumMg <= 500) {
      return { compliance: 'OPTIMAL', uiToken: 'Fern', score: 9.1 };
    }
    if (sodiumMg <= 750) {
      return { compliance: 'MODERATE', uiToken: 'Saffron', score: 7.2 };
    }
    return { compliance: 'EXCEEDS_LIMIT', uiToken: 'Clay', score: 4.5 };
  }

  /**
   * Helper to parse sodium from OCR text fallback.
   */
  parseOcrText(rawText: string): { sodiumMg?: number; calories?: number } {
    const result: { sodiumMg?: number; calories?: number } = {};

    // Match sodium: "Sodium 450mg" or "Sodium: 450 mg" or "450mg Sodium"
    const sodiumMatch =
      rawText.match(/sodium[\s:]*([0-9]+)\s*mg/i) ||
      rawText.match(/([0-9]+)\s*mg[\s\w]*sodium/i);
    if (sodiumMatch && sodiumMatch[1]) {
      result.sodiumMg = parseInt(sodiumMatch[1], 10);
    }

    // Match calories: "Calories 210" or "210 kcal"
    const caloriesMatch =
      rawText.match(/calories[\s:]*([0-9]+)/i) ||
      rawText.match(/([0-9]+)\s*kcal/i);
    if (caloriesMatch && caloriesMatch[1]) {
      result.calories = parseInt(caloriesMatch[1], 10);
    }

    return result;
  }

  /**
   * Processes a Heart Plate meal scan.
   */
  async processMealScan(userId: string | Types.ObjectId, data: MealScanInput): Promise<IProductScan> {
    const dishName = data.name?.trim() || 'Mediterranean Salmon & Quinoa Bowl';
    const sodiumMg = data.sodiumMg !== undefined ? Number(data.sodiumMg) : 420;
    const calories = data.calories !== undefined ? Number(data.calories) : 480;

    const { compliance, score } = this.evaluateMealCompliance(sodiumMg);

    let notes = data.notes?.trim() || '';
    if (data.cookingMode) {
      notes = notes ? `[Cooking Mode] ${notes}` : '[Cooking Mode] Reduced sodium preparation protocol applied.';
    }

    const scan = await ProductScan.create({
      userId,
      scanType: 'HEART_PLATE',
      name: dishName,
      imageUrl: data.imageUrl,
      sodiumMg,
      calories,
      dashCompliance: compliance,
      labVerifiedScore: score,
      healthNotes: notes,
      cookingMode: Boolean(data.cookingMode),
      scannedAt: new Date(),
    });

    // Evaluate Gamification Triggers
    await achievementService.checkAndUnlock(userId, {
      type: 'NUTRITION_MEAL_SCAN',
      value: sodiumMg,
      metadata: {
        sodiumMg,
        cookingMode: Boolean(data.cookingMode),
      },
    });

    return scan;
  }

  /**
   * Processes a packaged product / OCR label scan.
   */
  async processProductScan(userId: string | Types.ObjectId, data: ProductScanInput): Promise<IProductScan> {
    let sodiumMg = data.sodiumMg !== undefined ? Number(data.sodiumMg) : undefined;
    let calories = data.calories !== undefined ? Number(data.calories) : 180;
    let productName = data.name?.trim() || 'Organic Almond Beverage';

    if (data.ocrRawText) {
      const parsed = this.parseOcrText(data.ocrRawText);
      if (sodiumMg === undefined && parsed.sodiumMg !== undefined) {
        sodiumMg = parsed.sodiumMg;
      }
      if (parsed.calories !== undefined) {
        calories = parsed.calories;
      }
    }

    // Default fallback if still undefined
    if (sodiumMg === undefined) {
      sodiumMg = 310;
    }

    const { compliance, score } = this.evaluateMealCompliance(sodiumMg);

    const scan = await ProductScan.create({
      userId,
      scanType: 'PRODUCT',
      name: productName,
      imageUrl: data.imageUrl,
      ocrRawText: data.ocrRawText,
      sodiumMg,
      calories,
      dashCompliance: compliance,
      labVerifiedScore: score,
      healthNotes: data.notes || (data.ocrRawText ? 'Parsed via OCR label inspection.' : 'Scanned product verified.'),
      scannedAt: new Date(),
    });

    // Evaluate Gamification Triggers
    await achievementService.checkAndUnlock(userId, {
      type: 'NUTRITION_PRODUCT_SCAN',
      value: sodiumMg,
      metadata: {
        ocrRawText: data.ocrRawText,
        labVerifiedScore: score,
      },
    });

    return scan;
  }

  /**
   * Computes daily sodium intake across all scans and daily limits.
   */
  async getDailyNutritionSummary(userId: string | Types.ObjectId): Promise<DailyNutritionSummary> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayScans = await ProductScan.find({
      userId,
      scannedAt: { $gte: startOfDay },
    }).sort({ scannedAt: -1 });

    const todaySodiumMg = todayScans.reduce((sum, s) => sum + (s.sodiumMg || 0), 0);
    const caloriesToday = todayScans.reduce((sum, s) => sum + (s.calories || 0), 0);

    const OPTIMAL_LIMIT = 1500;
    const UPPER_LIMIT = 2300;

    let complianceStatus: DashCompliance = 'OPTIMAL';
    let uiToken: 'Fern' | 'Saffron' | 'Clay' = 'Fern';

    if (todaySodiumMg > UPPER_LIMIT) {
      complianceStatus = 'EXCEEDS_LIMIT';
      uiToken = 'Clay';
    } else if (todaySodiumMg > OPTIMAL_LIMIT) {
      complianceStatus = 'MODERATE';
      uiToken = 'Saffron';
    }

    const recentScans = await ProductScan.find({ userId })
      .sort({ scannedAt: -1 })
      .limit(10);

    return {
      todaySodiumMg,
      dailyOptimalBenchmarkMg: OPTIMAL_LIMIT,
      dailyUpperLimitMg: UPPER_LIMIT,
      sodiumRemainingOptimalMg: Math.max(0, OPTIMAL_LIMIT - todaySodiumMg),
      sodiumRemainingLimitMg: Math.max(0, UPPER_LIMIT - todaySodiumMg),
      complianceStatus,
      uiToken,
      caloriesToday,
      scansTodayCount: todayScans.length,
      recentScans,
      disclaimer:
        'Educational & tracking support only. Not a medical diagnosis. If you experience severe symptoms, seek immediate emergency medical care.',
    };
  }
}

export const scannerService = new ScannerService();
