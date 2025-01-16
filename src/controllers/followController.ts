import { Request, Response } from 'express';
import UserProfile from '../models/UserProfile';
import User from '../models/User';
import { Types } from 'mongoose';
import { sendResponse } from '../utils/responseUtils';
import { IUser } from '../models/User';
import { IUserProfile } from '../models/UserProfile';

class FollowController {
  public async getFollowingUsers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const userProfile = await UserProfile.findOne({ user: userId }).exec();
      if (!userProfile) {
        res.status(404).json({ message: 'User profile not found' });
        return;
      }

      const followers = userProfile.followers;

      const followerDetails = await UserProfile.find({
        user: { $in: followers },
      })
        .populate('user', 'username')
        .exec();

      const result = followerDetails.map((profile) => {
        const username = profile.user
          ? (profile.user as { username: string }).username
          : 'Unknown';
        return {
          username,
          id: profile.user._id,
        };
      });

      res.status(200).json({ followingUsers: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  public async getFollowers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const userProfile = await UserProfile.findOne({ user: userId }).exec();
      if (!userProfile) {
        res.status(404).json({ message: 'User profile not found' });
        return;
      }

      const followers = userProfile.followers;

      const followerDetails = await UserProfile.find({
        user: { $in: followers },
      })
        .populate('user', 'username')
        .exec();

      const result = followerDetails.map((profile) => {
        const username = profile.user
          ? (profile.user as { username: string }).username
          : 'Unknown';
        return {
          username,
          id: profile.user._id,
        };
      });

      res.status(200).json({ followers: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  public async toggleFollow(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        return sendResponse(res, 401, { message: 'Unauthorized' });
      }

      const { id: userId } = req.user;
      const { username } = req.params;

      if (!Types.ObjectId.isValid(userId)) {
        return sendResponse(res, 400, { message: 'Invalid user ID' });
      }

      const targetUser: IUser | null = await User.findOne({ username }).exec();
      if (!targetUser) {
        return sendResponse(res, 404, { message: 'Target user not found' });
      }

      const currentUserProfile: IUserProfile | null = await UserProfile.findOne(
        { user: userId }
      ).exec();
      const targetUserProfile: IUserProfile | null = await UserProfile.findOne({
        user: targetUser._id,
      }).exec();

      if (!currentUserProfile || !targetUserProfile) {
        return sendResponse(res, 404, { message: 'User profile not found' });
      }

      const targetUserId: Types.ObjectId = targetUser._id as Types.ObjectId; // id пользователя, на которого подписываемся
      const currentUserId: Types.ObjectId = new Types.ObjectId(userId); // id текущего пользователя

      const isFollowing: boolean = currentUserProfile.following.some(
        (followId) => followId.equals(targetUserId)
      );

      if (isFollowing) {
        currentUserProfile.following = currentUserProfile.following.filter(
          (followId) => !followId.equals(targetUserId)
        );
        targetUserProfile.followers = targetUserProfile.followers.filter(
          (followerId) => !followerId.equals(currentUserId)
        );
      } else {
        currentUserProfile.following.push(targetUserId);
        targetUserProfile.followers.push(currentUserId);
      }

      currentUserProfile.followingCount = currentUserProfile.following.length;
      targetUserProfile.followersCount = targetUserProfile.followers.length;

      await currentUserProfile.save();
      await targetUserProfile.save();

      return sendResponse(res, 200, {
        message: isFollowing
          ? 'Unfollowed successfully'
          : 'Followed successfully',
      });
    } catch (error) {
      console.error('Error in toggleFollow:', error);
      return sendResponse(res, 500, {
        message:
          error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  }
}

export default new FollowController();
