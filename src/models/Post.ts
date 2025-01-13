import { Schema, model, Document, Types } from 'mongoose';

export interface IPost extends Document {
  user: Types.ObjectId;
  content: string;
  imageUrls?: string[];
  videoUrl?: string;
  likes: Types.ObjectId[];
  likesCount: number;
  comments: Types.ObjectId[];
  commentsCount: number;
  reposts: Types.ObjectId[];
  repostsCount: number;
}

const postSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    imageUrls: [{ type: String }],
    videoUrl: { type: String },
    likesCount: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    commentsCount: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    repostsCount: { type: Number, default: 0 },
    reposts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const Post = model<IPost>('Post', postSchema);
export default Post;
