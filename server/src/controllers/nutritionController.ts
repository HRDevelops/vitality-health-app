import { Request, Response } from 'express';
import { nutritionService } from '../services/NutritionService';

export async function getLogs(req: Request, res: Response) {
  try {
    const date = req.query.date as string | undefined;
    const data = await nutritionService.getLogsForDate(date);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function createLog(req: Request, res: Response) {
  try {
    if (!req.body.mealType || !req.body.foodName || req.body.calories === undefined) {
      return res.status(400).json({ message: 'mealType, foodName and calories are required' });
    }
    const log = await nutritionService.createLog(req.body);
    res.status(201).json(log);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
