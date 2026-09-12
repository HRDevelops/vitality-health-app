import { Schema, model, Document, Types } from 'mongoose';
import { applyToJSON } from './plugin';

export type RelationshipType =
  | 'Parent'
  | 'Grandparent'
  | 'Sibling'
  | 'Child'
  | 'Spouse'
  | 'Relative';

export type AccessLevel = 'VIEW_VITALS' | 'EMERGENCY_ONLY';

export type CareCircleStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED';

export interface ICareCircleLink extends Document {
  _id: Types.ObjectId;
  observerId?: Types.ObjectId | null;
  subjectId: Types.ObjectId;
  relationshipType: RelationshipType;
  accessLevel: AccessLevel;
  inviteCode?: string;
  status: CareCircleStatus;
  createdAt: Date;
  updatedAt?: Date;
}

const CareCircleLinkSchema = new Schema<ICareCircleLink>(
  {
    observerId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    relationshipType: {
      type: String,
      required: true,
      enum: ['Parent', 'Grandparent', 'Sibling', 'Child', 'Spouse', 'Relative'],
      default: 'Relative',
    },
    accessLevel: {
      type: String,
      enum: ['VIEW_VITALS', 'EMERGENCY_ONLY'],
      default: 'VIEW_VITALS',
    },
    inviteCode: {
      type: String,
      uppercase: true,
      trim: true,
      index: { unique: true, sparse: true },
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REVOKED'],
      default: 'ACCEPTED',
      index: true,
    },
  },
  { timestamps: true }
);

CareCircleLinkSchema.index(
  { observerId: 1, subjectId: 1 },
  {
    unique: true,
    partialFilterExpression: { observerId: { $type: 'objectId' }, status: 'ACCEPTED' },
  }
);

applyToJSON(CareCircleLinkSchema);

export const CareCircleLink = model<ICareCircleLink>('CareCircleLink', CareCircleLinkSchema);
