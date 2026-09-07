import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { communityService } from '../services/CommunityService';

export async function getLeaderboard(req: AuthedRequest, res: Response) {
  try {
    const leaderboard = await communityService.getLeaderboard(req.userId!);
    res.json(leaderboard);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
