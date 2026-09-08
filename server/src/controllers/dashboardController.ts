import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { dashboardService } from '../services/DashboardService';

export async function getMetrics(req: AuthedRequest, res: Response) {
  try {
    const metrics = await dashboardService.getMetrics(req.userId!);
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function getWeeklyDigest(req: AuthedRequest, res: Response) {
  try {
    const digest = await dashboardService.getWeeklyDigest(req.userId!);
    res.json(digest);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function getHealthScoreHistory(req: AuthedRequest, res: Response) {
  try {
    const range = req.query.range === 'month' ? 'month' : 'week';
    const history = await dashboardService.getHealthScoreHistory(req.userId!, range);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
