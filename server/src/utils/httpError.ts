import { Response } from 'express';
import mongoose from 'mongoose';

export function handleControllerError(err: any, res: Response) {
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: err.message });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Invalid value for field "${err.path}"` });
  }

  // Prevent information disclosure in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ message: 'Internal server error' });
  }
  return res.status(500).json({ message: err.message });
}
