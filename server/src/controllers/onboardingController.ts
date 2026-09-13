import { Request, Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { onboardingService } from '../services/OnboardingService';

export async function submitQuestionnaire(req: AuthedRequest, res: Response) {
  try {
    const user = await onboardingService.submitQuestionnaire(req.userId!, req.body);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to submit onboarding questionnaire' });
  }
}

export async function createGuestSession(_req: Request, res: Response) {
  try {
    const result = await onboardingService.createGuestSession();
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to initialize guest session' });
  }
}

export async function claimGuest(req: AuthedRequest, res: Response) {
  try {
    const result = await onboardingService.claimGuestAccount(req.userId!, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to claim guest account' });
  }
}

export async function toggleDemoMode(req: AuthedRequest, res: Response) {
  try {
    const { enableDemo } = req.body;
    const user = await onboardingService.setDemoMode(req.userId!, enableDemo);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update demo mode' });
  }
}

export async function submitAppRating(req: AuthedRequest, res: Response) {
  try {
    const { rating, feedback } = req.body;
    const result = await onboardingService.submitRating(req.userId!, Number(rating), feedback);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to submit rating' });
  }
}
