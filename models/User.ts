import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  googleId?: string;
  createdAt: Date;
}

interface UserModel extends mongoose.Model<IUser> {
  generateRandomPassword(): Promise<string>;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Static method to generate random password
userSchema.statics.generateRandomPassword = async function() {
  const randomPassword = crypto.randomBytes(16).toString('hex');
  const hashedPassword = await bcrypt.hash(randomPassword, 10);
  return hashedPassword;
};

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export const User = (mongoose.models.User || mongoose.model<IUser, UserModel>('User', userSchema)) as UserModel;