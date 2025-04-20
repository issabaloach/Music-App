import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  googleId?: string;
  createdAt: Date;
}

export interface GoogleUserData {
  email: string;
  name: string;
  sub: string;
  picture?: string;
  password: string;
}