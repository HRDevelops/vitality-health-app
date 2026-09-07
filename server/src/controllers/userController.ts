import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { userService } from '../services/UserService';
import { handleControllerError } from '../utils/httpError';

export async function getProfile(req: AuthedRequest, res: Response) {
  try {
    const user = await userService.getProfile(req.userId!);
    res.json(user);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function updateWeight(req: AuthedRequest, res: Response) {
  try {
    const weightKg = Number(req.body.weightKg);
    if (Number.isNaN(weightKg)) {
      return res.status(400).json({ message: 'weightKg must be a number' });
    }
    const user = await userService.updateWeight(req.userId!, weightKg);
    res.json(user);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function updateProfile(req: AuthedRequest, res: Response) {
  try {
    const { name, heightCm, targetWeightKg } = req.body;
    const payload: { name?: string; heightCm?: number; targetWeightKg?: number } = {};
    if (name !== undefined) payload.name = String(name);
    if (heightCm !== undefined) payload.heightCm = Number(heightCm);
    if (targetWeightKg !== undefined) payload.targetWeightKg = Number(targetWeightKg);
    const user = await userService.updateProfile(req.userId!, payload);
    res.json(user);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function updateStreakFreeze(req: AuthedRequest, res: Response) {
  try {
    const equipped = Boolean(req.body.equipped);
    const user = await userService.setStreakFreezeEquipped(req.userId!, equipped);
    res.json(user);
  } catch (err: any) {
    if (err.message === 'No Streak Freeze available to equip') {
      return res.status(400).json({ message: err.message });
    }
    handleControllerError(err, res);
  }
}
