import mongoose, { Schema, Document } from 'mongoose';

export interface IBloodPressure extends Document {
  user: mongoose.Types.ObjectId;
  systolic: number;
  diastolic: number;
  date: Date;
  timeInZone: { [zone: string]: number }; // Store time spent in each BP zone
}

const BloodPressureSchema: Schema = new Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    systolic: { type: Number, required: true },
    diastolic: { type: Number, required: true },
    date: { type: Date, required: true },
    timeInZone: {
      'normal': { type: Number, default: 0 },
      'high': { type: Number, default: 0 },
      'hypertension': { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const BloodPressure = mongoose.model<IBloodPressure>('BloodPressure', BloodPressureSchema);