import mongoose, { Schema, Document } from 'mongoose';

export interface ILink extends Document {
  url: string;
  title?: string;
  description?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
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
});

export default mongoose.models.Link || mongoose.model<ILink>('Link', LinkSchema);
