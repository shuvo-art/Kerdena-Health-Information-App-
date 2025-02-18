import mongoose, { Schema, Document } from 'mongoose';

export interface IStep extends Document {
  user: mongoose.Types.ObjectId;
  steps: number;
  distanceKm: number;
  caloriesBurned: number;
  date: Date;
  hourlySteps: { [hour: number]: number };
  minutesWalked: number;
}

const StepSchema: Schema = new Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    steps: { type: Number, required: true },
    distanceKm: { type: Number, required: true },
    caloriesBurned: { type: Number, required: true },
    date: { type: Date, required: true },
    hourlySteps: { type: Map, of: Number, default: {} }, 
    minutesWalked: { type: Number, required: true }, 
  },
  { timestamps: true }
);

export const Step = mongoose.model<IStep>('Step', StepSchema);
