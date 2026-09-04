import { Request, Response } from 'express';
import { dashboardService } from '../services/DashboardService';

export async function getMetrics(req: Request, res: Response) {
  try {
    const metrics = await dashboardService.getMetrics();
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function getWeeklyDigest(req: Request, res: Response) {
  try {
    const digest = await dashboardService.getWeeklyDigest();
    res.json(digest);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function getHealthScoreHistory(req: Request, res: Response) {
  try {
    const range = req.query.range === 'month' ? 'month' : 'week';
    const history = await dashboardService.getHealthScoreHistory(range);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
