import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  user: Types.ObjectId;
  post: Types.ObjectId;
  content: string;
}

const commentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const Comment = model<IComment>('Comment', commentSchema);
export default Comment;
