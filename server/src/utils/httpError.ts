import { Response } from 'express';
import mongoose from 'mongoose';

export function handleControllerError(err: any, res: Response) {
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: err.message });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Invalid value for field "${err.path}"` });
  }
  return res.status(500).json({ message: err.message });
}
