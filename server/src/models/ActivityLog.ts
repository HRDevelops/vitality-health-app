import { Schema, model, Document, Types } from 'mongoose';
import { applyToJSON } from './plugin';

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  logDate: string;
  steps: number;
  goalSteps: number;
  caloriesBurned: number;
  distanceKm: number;
  activeMinutes: number;
  waterMl: number;
  waterGoalMl: number;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    logDate: { type: String, required: true },
    steps: { type: Number, default: 0 },
    goalSteps: { type: Number, default: 10000 },
    caloriesBurned: { type: Number, default: 0 },
    distanceKm: { type: Number, default: 0 },
    activeMinutes: { type: Number, default: 0 },
    waterMl: { type: Number, default: 0 },
    waterGoalMl: { type: Number, default: 2000 },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ userId: 1, logDate: 1 }, { unique: true });
applyToJSON(ActivityLogSchema);

export const ActivityLog = model<IActivityLog>('ActivityLog', ActivityLogSchema);
