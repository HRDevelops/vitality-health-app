import { Schema, model, Document, Types } from 'mongoose';
import { applyToJSON } from './plugin';

export interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  universityId: Types.ObjectId;
  captainId?: Types.ObjectId;
  memberCount: number;
  totalKm: number;
  totalCo2Kg: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    universityId: { type: Schema.Types.ObjectId, ref: 'University', required: true, index: true },
    captainId: { type: Schema.Types.ObjectId, ref: 'User' },
    memberCount: { type: Number, default: 1 },
    totalKm: { type: Number, default: 0 },
    totalCo2Kg: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TeamSchema.index({ universityId: 1, name: 1 });

applyToJSON(TeamSchema);

export const Team = model<ITeam>('Team', TeamSchema);
