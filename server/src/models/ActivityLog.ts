import { Schema, model, Document, Types } from 'mongoose';
import { applyToJSON } from './plugin';

export interface IWorkoutEntry {
  title: string;
  caloriesBurned: number;
  activeMinutes: number;
  distanceKm: number;
  loggedAt: Date;
}

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
  workouts: IWorkoutEntry[];
}

const WorkoutEntrySchema = new Schema<IWorkoutEntry>(
  {
    title: { type: String, required: true },
    caloriesBurned: { type: Number, default: 0 },
    activeMinutes: { type: Number, default: 0 },
    distanceKm: { type: Number, default: 0 },
    loggedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

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
    workouts: { type: [WorkoutEntrySchema], default: [] },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ userId: 1, logDate: 1 }, { unique: true });
applyToJSON(ActivityLogSchema);

export const ActivityLog = model<IActivityLog>('ActivityLog', ActivityLogSchema);
