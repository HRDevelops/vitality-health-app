import { Schema, model, Document, Types } from 'mongoose';
import { applyToJSON } from './plugin';

export type HealthMetricType = 'blood_pressure' | 'blood_glucose';
export type HealthMetricUiToken = 'Fern' | 'Saffron' | 'Clay';
export type GlucoseUnit = 'MG_DL' | 'MMOL_L';

export interface IHealthMetric extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: HealthMetricType;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  glucoseValue?: number; // stored in mg/dL
  glucoseUnit: GlucoseUnit;
  isFasting: boolean;
  category: string;
  uiToken: HealthMetricUiToken;
  isCriticalAlert: boolean;
  notes?: string;
  loggedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const HealthMetricSchema = new Schema<IHealthMetric>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['blood_pressure', 'blood_glucose'], required: true, index: true },
    systolic: { type: Number },
    diastolic: { type: Number },
    pulse: { type: Number },
    glucoseValue: { type: Number },
    glucoseUnit: { type: String, enum: ['MG_DL', 'MMOL_L'], default: 'MG_DL' },
    isFasting: { type: Boolean, default: false },
    category: { type: String, required: true },
    uiToken: { type: String, enum: ['Fern', 'Saffron', 'Clay'], required: true },
    isCriticalAlert: { type: Boolean, default: false },
    notes: { type: String, maxlength: 280 },
    loggedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

HealthMetricSchema.index({ userId: 1, loggedAt: -1 });

applyToJSON(HealthMetricSchema);

export const HealthMetric = model<IHealthMetric>('HealthMetric', HealthMetricSchema);
