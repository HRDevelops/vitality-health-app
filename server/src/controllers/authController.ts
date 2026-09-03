import { Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { handleControllerError } from '../utils/httpError';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (err: any) {
    if (err.message === 'Email and password are required') {
      return res.status(400).json({ message: err.message });
    }
    handleControllerError(err, res);
  }
}

export async function signup(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await authService.signup(email, password);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.message === 'Email and password are required') {
      return res.status(400).json({ message: err.message });
    }
    handleControllerError(err, res);
  }
}

export async function demoLogin(req: Request, res: Response) {
  try {
    const result = await authService.demoLogin();
    res.status(200).json(result);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function me(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    const user = await authService.me(token);
    res.json(user);
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
