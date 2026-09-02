import { Schema, model, Document, Types } from 'mongoose';
import { applyToJSON } from './plugin';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface INutritionLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  logDate: string;
  consumedAt: Date;
  mealType: MealType;
  foodName: string;
  imageUrl: string;
  calories: number;
  carbsGrams: number;
  proteinGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sugarGrams: number;
  warningNote: string | null;
}

const NutritionLogSchema = new Schema<INutritionLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    logDate: { type: String, required: true },
    consumedAt: { type: Date, default: () => new Date() },
    mealType: { type: String, enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'], required: true },
    foodName: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    calories: { type: Number, required: true },
    carbsGrams: { type: Number, default: 0 },
    proteinGrams: { type: Number, default: 0 },
    fatGrams: { type: Number, default: 0 },
    fiberGrams: { type: Number, default: 0 },
    sugarGrams: { type: Number, default: 0 },
    warningNote: { type: String, default: null },
  },
  { timestamps: true }
);

applyToJSON(NutritionLogSchema);

export const NutritionLog = model<INutritionLog>('NutritionLog', NutritionLogSchema);
