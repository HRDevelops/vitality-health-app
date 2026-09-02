import { Request, Response } from 'express';
import { userService } from '../services/UserService';

export async function getProfile(req: Request, res: Response) {
  try {
    const user = await userService.getProfile();
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
}
