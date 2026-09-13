import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { moveActivityService } from '../services/MoveActivityService';
import { handleControllerError } from '../utils/httpError';

export async function logActivity(req: AuthedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const activity = await moveActivityService.logActivity(req.userId, req.body);
    res.status(201).json(activity);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function getActivities(req: AuthedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const activityType = req.query.activityType as any;
    const isFlagged = req.query.isFlagged !== undefined ? req.query.isFlagged === 'true' : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const activities = await moveActivityService.getActivities(req.userId, {
      activityType,
      isFlagged,
      limit,
    });
    res.json(activities);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function getSummary(req: AuthedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const summary = await moveActivityService.getSummary(req.userId);
    res.json(summary);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}
