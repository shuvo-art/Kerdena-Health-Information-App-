import mongoose, { Schema, Document } from 'mongoose';

export interface IHeartRate extends Document {
    user: mongoose.Types.ObjectId;
    heartRate: number;
    date: Date;
    timeInZone: { [zone: string]: number }; // Store time spent in each heart rate zone
  }

  const HeartRateSchema: Schema = new Schema(
    {
      user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
      heartRate: { type: Number, required: true },
      date: { type: Date, required: true },
      timeInZone: {
        '0-80': { type: Number, default: 0 },
        '80-100': { type: Number, default: 0 },
        '100-110': { type: Number, default: 0 },
        '110+': { type: Number, default: 0 },
      },
    },
    { timestamps: true }
  );
  
export const HeartRate = mongoose.model<IHeartRate>('HeartRate', HeartRateSchema);
