import { Schema, model, Document, Types } from 'mongoose';
export interface IUserProfile extends Document {
  user: Types.ObjectId;
  avatar: Buffer;
  avatarContentType?: string;
  bio: string;
  gender: 'male' | 'female' | 'other';
  address: {
    city?: string;
    state?: string;
    country?: string;
  };
  interests: string[];
  occupation?: string; // Работа
  education?: string;
  followers: Types.ObjectId[]; // Подписчики
  following: Types.ObjectId[]; // Подписки
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    avatar: { type: Buffer },
    avatarContentType: { type: String },
    bio: { type: String, default: '' },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    address: {
      city: { type: String },
      state: { type: String },
      country: { type: String },
    },
    interests: [{ type: String }],
    occupation: { type: String },
    education: { type: String },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const UserProfile = model<IUserProfile>('UserProfile', userProfileSchema);

export default UserProfile;
