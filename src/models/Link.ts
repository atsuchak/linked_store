import mongoose, { Schema, Document } from 'mongoose';

export interface ILink extends Document {
  url: string;
  title?: string;
  description?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  isPinned?: boolean;
}

const LinkSchema: Schema = new Schema({
  url: {
    type: String,
    required: [true, 'Please provide a URL'],
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
});

// Delete the cached model in development to ensure schema updates are applied
if (process.env.NODE_ENV === 'development' && mongoose.models.Link) {
  delete mongoose.models.Link;
}

export default mongoose.models.Link || mongoose.model<ILink>('Link', LinkSchema);
