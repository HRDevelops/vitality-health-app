import { Schema, model, Document, Types } from 'mongoose';
import { applyToJSON } from './plugin';

export type AchievementCategory = 'CLINICAL' | 'MOVE' | 'NUTRITION' | 'COMMUNITY' | 'MILESTONE';
export type AchievementRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export interface IUserAchievement extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  achievementId: number;
  key: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  iconName: string;
  unlockedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserAchievementSchema = new Schema<IUserAchievement>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    achievementId: { type: Number, required: true },
    key: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['CLINICAL', 'MOVE', 'NUTRITION', 'COMMUNITY', 'MILESTONE'],
      required: true,
    },
    rarity: {
      type: String,
      enum: ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'],
      required: true,
    },
    iconName: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

applyToJSON(UserAchievementSchema);
UserAchievementSchema.set('toJSON', {
  ...UserAchievementSchema.get('toJSON'),
  transform: (doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const UserAchievement = model<IUserAchievement>('UserAchievement', UserAchievementSchema);
