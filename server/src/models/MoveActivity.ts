import { Schema, model, Document, Types } from 'mongoose';
import { applyToJSON } from './plugin';

export type MoveActivityType = 'WALKATHON' | 'CYCLING';

export interface IMoveActivity extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  activityType: MoveActivityType;
  distanceKm: number;
  durationMinutes: number;
  co2SavingsKg: number;
  averagePaceKmh: number;
  isFlagged: boolean;
  flagReason?: string;
  loggedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const MoveActivitySchema = new Schema<IMoveActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    activityType: { type: String, enum: ['WALKATHON', 'CYCLING'], required: true },
    distanceKm: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    co2SavingsKg: { type: Number, required: true },
    averagePaceKmh: { type: Number, required: true },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String },
    loggedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

MoveActivitySchema.index({ userId: 1, loggedAt: -1 });

applyToJSON(MoveActivitySchema);

export const MoveActivity = model<IMoveActivity>('MoveActivity', MoveActivitySchema);
