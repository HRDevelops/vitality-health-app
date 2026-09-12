import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { careCircleService } from '../services/CareCircleService';

export class CareCircleController {
  async getMonitoredMembers(req: AuthedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      const members = await careCircleService.getMonitoredMembers(req.userId);
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to fetch care circle members' });
    }
  }

  async getMemberVitalHistory(req: AuthedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      const { subjectId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;

      const history = await careCircleService.getMemberVitalHistory(req.userId, subjectId, limit);
      res.json(history);
    } catch (error: any) {
      res.status(403).json({ message: error.message || 'Failed to fetch member vital history' });
    }
  }

  async generateInviteCode(req: AuthedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      const { relationshipType } = req.body;
      const result = await careCircleService.generateInviteCode(req.userId, relationshipType);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Failed to generate pairing code' });
    }
  }

  async connectWithCode(req: AuthedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      const { inviteCode, relationshipType } = req.body;
      if (!inviteCode) {
        res.status(400).json({ message: 'Invite code is required' });
        return;
      }

      const member = await careCircleService.connectWithCode(
        req.userId,
        inviteCode,
        relationshipType
      );
      res.json({ message: 'Connected successfully to family member', member });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Failed to connect with code' });
    }
  }

  async revokeLink(req: AuthedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      const { linkId } = req.params;
      const result = await careCircleService.revokeLink(req.userId, linkId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Failed to revoke care circle link' });
    }
  }
}

export const careCircleController = new CareCircleController();
