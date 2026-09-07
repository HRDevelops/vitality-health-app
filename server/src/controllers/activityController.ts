import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { activityService } from '../services/ActivityService';
import { handleControllerError } from '../utils/httpError';

export async function getDaily(req: AuthedRequest, res: Response) {
  try {
    const date = req.query.date as string | undefined;
    const data = await activityService.getDaily(req.userId!, date);
    res.json(data);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function getTrends(req: AuthedRequest, res: Response) {
  try {
    const rangeParam = req.query.range as string;
    const range = rangeParam === 'month' ? 'month' : rangeParam === 'daily' ? 'daily' : 'week';
    const data = await activityService.getTrends(req.userId!, range);
    res.json(data);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function getWaterTrend(req: AuthedRequest, res: Response) {
  try {
    const data = await activityService.getWaterTrend(req.userId!);
    res.json(data);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function getIntensityTrend(req: AuthedRequest, res: Response) {
  try {
    const data = await activityService.getIntensityTrend(req.userId!);
    res.json(data);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function logWater(req: AuthedRequest, res: Response) {
  try {
    const amountMl = Number(req.body.amountMl ?? 250);
    const log = await activityService.logWater(req.userId!, amountMl);
    res.status(201).json(log);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function logWorkout(req: AuthedRequest, res: Response) {
  try {
    const log = await activityService.logWorkout(req.userId!, req.body);
    res.status(201).json(log);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function deleteWorkout(req: AuthedRequest, res: Response) {
  try {
    const data = await activityService.deleteWorkout(req.userId!, req.params.workoutId);
    res.json(data);
  } catch (err: any) {
    if (err.message === 'Workout not found') {
      return res.status(404).json({ message: err.message });
    }
    handleControllerError(err, res);
  }
}
