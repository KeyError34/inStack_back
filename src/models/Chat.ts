import { Schema, model, Document, Types } from 'mongoose';

export interface IChat extends Document {
  users: Types.ObjectId[];
  messages: Types.ObjectId[];
}

const chatSchema = new Schema<IChat>(
  {
    users: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  },
  { timestamps: true }
);

const Chat = model<IChat>('Chat', chatSchema);
export default Chat;
