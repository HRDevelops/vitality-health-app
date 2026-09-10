import { Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { handleControllerError } from '../utils/httpError';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(200).json(result);
  } catch (err: any) {
    if (err.message === 'Email and password are required') {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === 'Invalid email or password') {
      return res.status(401).json({ message: err.message });
    }
    handleControllerError(err, res);
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(201).json(result);
  } catch (err: any) {
    if (err.message === 'Email and password are required' || err.message === 'Password must be at least 8 characters') {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === 'An account with this email already exists') {
      return res.status(409).json({ message: err.message });
    }
    handleControllerError(err, res);
  }
}

export async function socialLogin(req: Request, res: Response) {
  try {
    const provider = req.body.provider === 'apple' ? 'apple' : 'google';
    const result = await authService.socialLogin(provider);
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(200).json(result);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function demoLogin(req: Request, res: Response) {
  try {
    const result = await authService.demoLogin();
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(200).json(result);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
}

export async function me(req: Request, res: Response) {
  try {
    let token = req.cookies?.token;
    if (!token) {
      const authHeader = req.headers.authorization ?? '';
      token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    }
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    const user = await authService.me(token);
    res.json(user);
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.status(200).json(result);
  } catch (err: any) {
    handleControllerError(err, res);
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const result = await authService.resetPassword(req.body.token, req.body.newPassword);
    res.status(200).json(result);
  } catch (err: any) {
    if (
      err.message === 'Invalid or expired reset token' ||
      err.message === 'Password must be at least 8 characters' ||
      err.message === 'Token and new password are required'
    ) {
      return res.status(400).json({ message: err.message });
    }
    handleControllerError(err, res);
  }
}
