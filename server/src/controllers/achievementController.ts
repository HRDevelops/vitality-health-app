import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { achievementService } from '../services/AchievementService';

export async function getAchievements(req: AuthedRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const summary = await achievementService.getUserAchievements(req.userId);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch achievements' });
  }
}
