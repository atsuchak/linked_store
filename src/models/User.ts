import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  phone?: string;
  image?: string;
  sessionVersion: number;
  createdAt: Date;
  historyOrder?: string[];
  authProvider?: string;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    select: false,
  },
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  image: {
    type: String,
  },
  sessionVersion: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  historyOrder: {
    type: [String],
    default: [],
  },
  authProvider: {
    type: String,
    enum: ['credentials', 'google'],
    default: 'credentials',
  },
});

if (process.env.NODE_ENV === 'development' && mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
