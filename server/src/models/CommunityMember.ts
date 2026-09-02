import { Schema, model, Document, Types } from 'mongoose';
import { applyToJSON } from './plugin';

export interface ICommunityMember extends Document {
  _id: Types.ObjectId;
  name: string;
  avatarUrl: string;
  steps: number;
  isCurrentUser: boolean;
}

const CommunityMemberSchema = new Schema<ICommunityMember>(
  {
    name: { type: String, required: true },
    avatarUrl: { type: String, required: true },
    steps: { type: Number, required: true },
    isCurrentUser: { type: Boolean, default: false },
  },
  { timestamps: true }
);

applyToJSON(CommunityMemberSchema);

export const CommunityMember = model<ICommunityMember>('CommunityMember', CommunityMemberSchema);
