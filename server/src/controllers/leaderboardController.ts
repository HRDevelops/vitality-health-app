import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { leaderboardService, LeaderboardTimeframe } from '../services/LeaderboardService';
import { User } from '../models/User';

export class LeaderboardController {
  async getIndividualLeaderboard(req: AuthedRequest, res: Response): Promise<void> {
    try {
      const timeframe = (req.query.timeframe as LeaderboardTimeframe) || 'all_time';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const currentUserId = req.userId;

      const result = await leaderboardService.getIndividualLeaderboard(timeframe, limit, currentUserId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch individual leaderboard' });
    }
  }

  async getTeamLeaderboard(req: AuthedRequest, res: Response): Promise<void> {
    try {
      const timeframe = (req.query.timeframe as LeaderboardTimeframe) || 'all_time';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const universityId = req.query.universityId as string | undefined;
      
      let currentTeamId: string | undefined;
      if (req.userId) {
        const user = await User.findById(req.userId).select('teamId');
        currentTeamId = user?.teamId?.toString();
      }

      const result = await leaderboardService.getTeamLeaderboard(universityId, timeframe, limit, currentTeamId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch team leaderboard' });
    }
  }

  async getUniversityLeaderboard(req: AuthedRequest, res: Response): Promise<void> {
    try {
      const timeframe = (req.query.timeframe as LeaderboardTimeframe) || 'all_time';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      
      let currentUniversityId: string | undefined;
      if (req.userId) {
        const user = await User.findById(req.userId).select('universityId');
        currentUniversityId = user?.universityId?.toString();
      }

      const result = await leaderboardService.getUniversityLeaderboard(timeframe, limit, currentUniversityId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch university leaderboard' });
    }
  }

  async getUniversities(_req: AuthedRequest, res: Response): Promise<void> {
    try {
      const universities = await leaderboardService.getUniversities();
      res.json(universities);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch universities' });
    }
  }

  async getTeams(req: AuthedRequest, res: Response): Promise<void> {
    try {
      const universityId = req.query.universityId as string | undefined;
      const teams = await leaderboardService.getTeams(universityId);
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch teams' });
    }
  }

  async joinTeam(req: AuthedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const teamId = req.body.teamId || req.body.id;
      if (!teamId) {
        res.status(400).json({ message: 'teamId is required' });
        return;
      }

      const result = await leaderboardService.joinTeam(userId, teamId);
      res.json({ message: 'Joined team successfully', ...result });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Failed to join team' });
    }
  }

  async createTeam(req: AuthedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { name, universityId } = req.body;
      if (!name || !universityId) {
        res.status(400).json({ message: 'Team name and universityId are required' });
        return;
      }

      const result = await leaderboardService.createTeam(userId, { name, universityId });
      res.status(201).json({ message: 'Team created successfully', ...result });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Failed to create team' });
    }
  }
}

export const leaderboardController = new LeaderboardController();
