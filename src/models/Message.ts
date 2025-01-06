import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  user: Types.ObjectId;
  chat: Types.ObjectId;
  content: string;
}

const messageSchema = new Schema<IMessage>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = model<IMessage>('Message', messageSchema);
export default Message;
