import { Schema, model, Document, Types } from 'mongoose';

export interface ILike extends Document {
  user: Types.ObjectId; // who liked
  post: Types.ObjectId; // where liked
}

const likePostSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  },
  { timestamps: true }
);

const Like = model<ILike>('LikePost', likePostSchema);
export default Like