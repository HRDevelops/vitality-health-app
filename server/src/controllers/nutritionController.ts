import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { nutritionService } from '../services/NutritionService';
import { handleControllerError } from '../utils/httpError';

export async function getLogs(req: AuthedRequest, res: Response) {
  try {
    const date = req.query.date as string | undefined;
    const data = await nutritionService.getLogsForDate(req.userId!, date);
    res.json(data);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function createLog(req: AuthedRequest, res: Response) {
  try {
    if (!req.body.mealType || !req.body.foodName || req.body.calories === undefined) {
      return res.status(400).json({ message: 'mealType, foodName and calories are required' });
    }
    const log = await nutritionService.createLog(req.userId!, req.body);
    res.status(201).json(log);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}
