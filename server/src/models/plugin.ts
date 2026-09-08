import { Schema } from 'mongoose';

export function applyToJSON(schema: Schema) {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  });
}
