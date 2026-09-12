import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { healthMetricService } from '../services/HealthMetricService';
import { handleControllerError } from '../utils/httpError';

export async function createReading(req: AuthedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const metric = await healthMetricService.createReading(req.userId, req.body);
    res.status(201).json(metric);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function getHistory(req: AuthedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const type = req.query.type as any;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const history = await healthMetricService.getHistory(req.userId, {
      type,
      limit,
      startDate,
      endDate,
    });
    res.json(history);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function getSummary(req: AuthedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const summary = await healthMetricService.getSummary(req.userId);
    res.json(summary);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}
