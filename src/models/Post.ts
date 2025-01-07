import { Schema, model, Document, Types } from 'mongoose';

export interface IPost extends Document {
  user: Types.ObjectId;
  content: string;
  imageUrl?: string;
  likesCount:number;
  comments: Types.ObjectId[];
  reposts: Types.ObjectId[];
}

const postSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    likesCount: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    reposts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const Post = model<IPost>('Post', postSchema);
export default Post;
