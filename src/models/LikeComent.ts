import { Schema, model, Document, Types } from 'mongoose';

export interface ILike extends Document {
  user: Types.ObjectId;
  post: Types.ObjectId;
}

const likeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Comment', required: true },
  },
  { timestamps: true }
);

const Like = model<ILike>('LikeComment', likeSchema);
export default Like;
