import { Request, Response } from 'express';
import { communityService } from '../services/CommunityService';

export async function getLeaderboard(req: Request, res: Response) {
  try {
    const leaderboard = await communityService.getLeaderboard();
    res.json(leaderboard);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
