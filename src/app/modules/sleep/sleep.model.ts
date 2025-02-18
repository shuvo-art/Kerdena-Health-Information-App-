import mongoose, { Schema, Document } from 'mongoose';

export interface ISleep extends Document {
  user: mongoose.Types.ObjectId;
  totalSleepHours: number;
  totalSleepMinutes: number;  // Total sleep minutes
  restfulSleepHours: number;
  restfulSleepMinutes: number;  // Restful sleep minutes
  lightSleepHours: number;
  lightSleepMinutes: number;  // Light sleep minutes
  awakeHours: number;
  awakeMinutes: number;  // Awake minutes
  date: Date;
}

const SleepSchema: Schema = new Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    totalSleepHours: { type: Number, required: true },
    totalSleepMinutes: { type: Number, required: true },  // Total sleep minutes
    restfulSleepHours: { type: Number, required: true },
    restfulSleepMinutes: { type: Number, required: true },  // Restful sleep minutes
    lightSleepHours: { type: Number, required: true },
    lightSleepMinutes: { type: Number, required: true },  // Light sleep minutes
    awakeHours: { type: Number, required: true },
    awakeMinutes: { type: Number, required: true },  // Awake minutes
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Sleep = mongoose.model<ISleep>('Sleep', SleepSchema);
