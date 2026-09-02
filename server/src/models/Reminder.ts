import { Schema, model, Document, Types } from 'mongoose';
import { applyToJSON } from './plugin';

export interface IReminder extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  subtitle: string;
  time: string;
  enabled: boolean;
}

const ReminderSchema = new Schema<IReminder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    time: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

applyToJSON(ReminderSchema);

export const Reminder = model<IReminder>('Reminder', ReminderSchema);
