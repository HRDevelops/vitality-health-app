import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { userService } from '../services/UserService';
import { authService } from '../services/AuthService';
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
    const { name, heightCm, targetWeightKg, avatarUrl, stepGoal, waterGoal, calorieGoal, macros } = req.body;
    const payload: {
      name?: string;
      heightCm?: number;
      targetWeightKg?: number;
      avatarUrl?: string;
      stepGoal?: number;
      waterGoal?: number;
      calorieGoal?: number;
      macros?: { protein?: number; carbs?: number; fat?: number };
    } = {};
    if (name !== undefined) payload.name = String(name);
    if (heightCm !== undefined) payload.heightCm = Number(heightCm);
    if (targetWeightKg !== undefined) payload.targetWeightKg = Number(targetWeightKg);
    if (avatarUrl !== undefined) payload.avatarUrl = String(avatarUrl);
    if (stepGoal !== undefined) payload.stepGoal = Number(stepGoal);
    if (waterGoal !== undefined) payload.waterGoal = Number(waterGoal);
    if (calorieGoal !== undefined) payload.calorieGoal = Number(calorieGoal);
    if (macros !== undefined) {
      payload.macros = {};
      if (macros.protein !== undefined) payload.macros.protein = Number(macros.protein);
      if (macros.carbs !== undefined) payload.macros.carbs = Number(macros.carbs);
      if (macros.fat !== undefined) payload.macros.fat = Number(macros.fat);
    }
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

export async function changePassword(req: AuthedRequest, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.userId!, currentPassword, newPassword);
    res.status(200).json(result);
  } catch (err: any) {
    if (err.message === 'Current password is incorrect') {
      return res.status(401).json({ message: err.message });
    }
    if (err.message === 'New password must be at least 8 characters' || err.message === 'Current and new password are required') {
      return res.status(400).json({ message: err.message });
    }
    handleControllerError(err, res);
  }
}
