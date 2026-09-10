import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken } from '../utils/jwt';

export interface AuthedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.token;
  if (!token) {
    const authHeader = req.headers.authorization ?? '';
    token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  }

  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const payload = verifyAuthToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
