import { Request, Response } from 'express';
import { activityService } from '../services/ActivityService';
import { handleControllerError } from '../utils/httpError';

export async function getDaily(req: Request, res: Response) {
  try {
    const date = req.query.date as string | undefined;
    const data = await activityService.getDaily(date);
    res.json(data);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function getTrends(req: Request, res: Response) {
  try {
    const range = (req.query.range as string) === 'month' ? 'month' : 'week';
    const data = await activityService.getTrends(range);
    res.json(data);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function logWater(req: Request, res: Response) {
  try {
    const amountMl = Number(req.body.amountMl ?? 250);
    const log = await activityService.logWater(amountMl);
    res.status(201).json(log);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function logWorkout(req: Request, res: Response) {
  try {
    const log = await activityService.logWorkout(req.body);
    res.status(201).json(log);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}
