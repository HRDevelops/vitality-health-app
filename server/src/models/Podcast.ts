import { Schema, model, Document, Types } from 'mongoose';
import { applyToJSON } from './plugin';

export interface IPodcast extends Document {
  _id: Types.ObjectId;
  title: string;
  author: string;
  durationMinutes: number;
  audioUrl: string;
  imageUrl: string;
  isPremium: boolean;
  isDailyPick: boolean;
  category: string;
  tags: string[];
  description: string;
}

const PodcastSchema = new Schema<IPodcast>(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    audioUrl: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    isPremium: { type: Boolean, default: false },
    isDailyPick: { type: Boolean, default: false },
    category: { type: String, default: 'Wellness' },
    tags: { type: [String], default: [] },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

applyToJSON(PodcastSchema);

export const Podcast = model<IPodcast>('Podcast', PodcastSchema);
