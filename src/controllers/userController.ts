import { Request, Response } from 'express';
import UserProfile from '../models/UserProfile';
import { sendResponse } from '../utils/responseUtils';

class UserProfileController {

   // Получить профиль текущего пользователя (GET)

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 401, { message: 'Unauthorized' });
      }

      const profile = await UserProfile.findOne({ user: userId }).populate(
        'user',
        'username email fullName'
      );

      if (!profile) {
        return sendResponse(res, 404, { message: 'Profile not found' });
      }

      return sendResponse(res, 200, {
        message: 'Profile found',
        data: profile,
      });
    } catch (error) {
      console.error(error);
      return sendResponse(res, 500, { message: 'Server error' });
    }
  }

  
   // Создать новый профиль пользователя (POST)

  static async createProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 401, { message: 'Unauthorized' });
      }

      const existingProfile = await UserProfile.findOne({ user: userId });
      if (existingProfile) {
        return sendResponse(res, 400, { message: 'Profile already exists' });
      }

      const profile = new UserProfile({ user: userId, ...req.body });
      await profile.save();

      return sendResponse(res, 201, {
        message: 'Profile created successfully',
        data: profile,
      });
    } catch (error) {
      console.error(error);
      return sendResponse(res, 500, { message: 'Server error' });
    }
  }


   //Обновить профиль пользователя (PUT)

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 401, { message: 'Unauthorized' });
      }

      const updatedProfile = await UserProfile.findOneAndUpdate(
        { user: userId },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updatedProfile) {
        return sendResponse(res, 404, { message: 'Profile not found' });
      }

      return sendResponse(res, 200, {
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      console.error(error);
      return sendResponse(res, 500, { message: 'Server error' });
    }
  }
}

export default UserProfileController;
