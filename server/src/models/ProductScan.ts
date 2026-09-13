import { Schema, model, Document, Types } from 'mongoose';
import { applyToJSON } from './plugin';

export type ScanType = 'HEART_PLATE' | 'PRODUCT';
export type DashCompliance = 'OPTIMAL' | 'MODERATE' | 'EXCEEDS_LIMIT';

export interface IProductScan extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  scanType: ScanType;
  name: string;
  imageUrl?: string;
  ocrRawText?: string;
  sodiumMg: number;
  calories: number;
  dashCompliance: DashCompliance;
  labVerifiedScore: number;
  healthNotes?: string;
  cookingMode?: boolean;
  scannedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductScanSchema = new Schema<IProductScan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scanType: { type: String, enum: ['HEART_PLATE', 'PRODUCT'], required: true },
    name: { type: String, required: true },
    imageUrl: { type: String },
    ocrRawText: { type: String },
    sodiumMg: { type: Number, required: true },
    calories: { type: Number, default: 0 },
    dashCompliance: {
      type: String,
      enum: ['OPTIMAL', 'MODERATE', 'EXCEEDS_LIMIT'],
      required: true,
    },
    labVerifiedScore: { type: Number, default: 8.0 },
    healthNotes: { type: String },
    cookingMode: { type: Boolean, default: false },
    scannedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

ProductScanSchema.index({ userId: 1, scannedAt: -1 });

applyToJSON(ProductScanSchema);
ProductScanSchema.set('toJSON', {
  ...ProductScanSchema.get('toJSON'),
  transform: (doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const ProductScan = model<IProductScan>('ProductScan', ProductScanSchema);
