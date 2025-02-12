import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: string;
  profileImage?: string;
  language?: string;
  plan: 'Free' | 'Premium' | null;
  birthday?: Date | null;
  height?: number | null;
  gender?: 'male' | 'female' | 'other' | null;
  weight?: number | null;
  phoneNumber?: string | null;
  restfulThreshold?: number | null; 
  lightThreshold?: number | null;   
  awakeThreshold?: number | null;   
  spo2Threshold?: number | null;
  systolicThreshold?: number | null;
  diastolicThreshold?: number | null;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    profileImage: { type: String },
    language: { type: String, default: null, nullable: true },
    plan: { type: String, enum: ['Free', 'Premium'], default: 'Free' },
    birthday: { type: Date, default: null },
    height: { type: Number, default: null },
    gender: { type: String, enum: ['male', 'female', 'other'], default: null },
    weight: { type: Number, default: null },
    phoneNumber: { type: String, default: null },
    restfulThreshold: { type: Number, default: 3 }, 
    lightThreshold: { type: Number, default: 2 },   
    awakeThreshold: { type: Number, default: 2 }, 
    spo2Threshold: { type: Number, default: 95 },
    systolicThreshold: { type: Number, default: 120 },
    diastolicThreshold: { type: Number, default: 80 },  
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
