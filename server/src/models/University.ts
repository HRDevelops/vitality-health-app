import { Schema, model, Document, Types } from 'mongoose';
import { applyToJSON } from './plugin';

export interface IUniversity extends Document {
  _id: Types.ObjectId;
  name: string;
  shortCode: string;
  logoUrl?: string;
  totalKm: number;
  totalCo2Kg: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const UniversitySchema = new Schema<IUniversity>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    shortCode: { type: String, required: true, uppercase: true, trim: true },
    logoUrl: { type: String, default: '' },
    totalKm: { type: Number, default: 0 },
    totalCo2Kg: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UniversitySchema.index({ shortCode: 1 });

applyToJSON(UniversitySchema);

export const University = model<IUniversity>('University', UniversitySchema);
