import { Request, Response } from 'express';
import { userService } from '../services/UserService';
import { handleControllerError } from '../utils/httpError';

export async function getProfile(req: Request, res: Response) {
  try {
    const user = await userService.getProfile();
    res.json(user);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function updateWeight(req: Request, res: Response) {
  try {
    const weightKg = Number(req.body.weightKg);
    if (Number.isNaN(weightKg)) {
      return res.status(400).json({ message: 'weightKg must be a number' });
    }
    const user = await userService.updateWeight(weightKg);
    res.json(user);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const { name, heightCm, targetWeightKg } = req.body;
    const payload: { name?: string; heightCm?: number; targetWeightKg?: number } = {};
    if (name !== undefined) payload.name = String(name);
    if (heightCm !== undefined) payload.heightCm = Number(heightCm);
    if (targetWeightKg !== undefined) payload.targetWeightKg = Number(targetWeightKg);
    const user = await userService.updateProfile(payload);
    res.json(user);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}
