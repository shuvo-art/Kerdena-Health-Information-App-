import mongoose, { Schema, Document } from 'mongoose';

export interface ISleep extends Document {
  user: mongoose.Types.ObjectId;
  totalSleepHours: number;
  restfulSleepHours: number;
  lightSleepHours: number;
  awakeHours: number;
  date: Date;
}

const SleepSchema: Schema = new Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    totalSleepHours: { type: Number, required: true },
    restfulSleepHours: { type: Number, required: true },
    lightSleepHours: { type: Number, required: true },
    awakeHours: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Sleep = mongoose.model<ISleep>('Sleep', SleepSchema);
