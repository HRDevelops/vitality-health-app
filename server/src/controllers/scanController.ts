import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { scannerService } from '../services/ScannerService';

export async function logMealScan(req: AuthedRequest, res: Response) {
  try {
    const scan = await scannerService.processMealScan(req.userId!, req.body);
    res.status(201).json(scan);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to process meal scan' });
  }
}

export async function logProductScan(req: AuthedRequest, res: Response) {
  try {
    const scan = await scannerService.processProductScan(req.userId!, req.body);
    res.status(201).json(scan);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to process product scan' });
  }
}

export async function getDailySummary(req: AuthedRequest, res: Response) {
  try {
    const summary = await scannerService.getDailyNutritionSummary(req.userId!);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch nutrition summary' });
  }
}
