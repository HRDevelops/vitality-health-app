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
    const rangeParam = req.query.range as string;
    const range = rangeParam === 'month' ? 'month' : rangeParam === 'daily' ? 'daily' : 'week';
    const data = await activityService.getTrends(range);
    res.json(data);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function getWaterTrend(req: Request, res: Response) {
  try {
    const data = await activityService.getWaterTrend();
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

export async function deleteWorkout(req: Request, res: Response) {
  try {
    const data = await activityService.deleteWorkout(req.params.workoutId);
    res.json(data);
  } catch (err: any) {
    if (err.message === 'Workout not found') {
      return res.status(404).json({ message: err.message });
    }
    handleControllerError(err, res);
  }
}
