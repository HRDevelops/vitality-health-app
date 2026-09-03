import { Schema, model, Document, Types } from 'mongoose';
import { applyToJSON } from './plugin';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  avatarUrl: string;
  healthScore: number;
  healthScoreNote: string;
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  age: number;
  isPremium: boolean;
  podcastSessionsCompleted: number;
  podcastStreakCount: number;
  lastListenDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatarUrl: { type: String, required: true },
    healthScore: { type: Number, default: 84 },
    healthScoreNote: {
      type: String,
      default: 'Based on your overall health test, your score is good.',
    },
    currentWeightKg: { type: Number, default: 58 },
    targetWeightKg: { type: Number, default: 55 },
    heightCm: { type: Number, default: 165 },
    age: { type: Number, default: 24 },
    isPremium: { type: Boolean, default: false },
    podcastSessionsCompleted: { type: Number, default: 0 },
    podcastStreakCount: { type: Number, default: 0 },
    lastListenDate: { type: String, default: null },
  },
  { timestamps: true }
);

applyToJSON(UserSchema);

export const User = model<IUser>('User', UserSchema);
