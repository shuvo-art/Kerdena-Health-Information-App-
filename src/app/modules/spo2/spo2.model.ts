import mongoose, { Schema, Document } from 'mongoose';

export interface ISpO2 extends Document {
  user: mongoose.Types.ObjectId;
  spo2: number;
  date: Date;
}

const SpO2Schema: Schema = new Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    spo2: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export const SpO2 = mongoose.model<ISpO2>('SpO2', SpO2Schema);
