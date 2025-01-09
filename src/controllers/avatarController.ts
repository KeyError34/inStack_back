import { Request, Response } from 'express';
import UserProfile from '../models/UserProfile';
import { FileCompressor } from '../utils/fileCompressor';
import { sendResponse } from '../utils/responseUtils';

class AvatarController {
  // Метод загрузки аватара

  public async uploadAvatar(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        return sendResponse(res, 401, { message: 'User is not authorized' });
      }

      if (!req.file) {
        return sendResponse(res, 401, { message: 'File not uploaded' });
      }

      const userId = req.user.id;

      const compressedImage = await FileCompressor.compressImage(
        req.file.buffer
      );

      const updatedUser = await UserProfile.findOneAndUpdate(
        { user: userId },
        { avatar: compressedImage, avatarContentType: req.file.mimetype },
        { new: true, upsert: true }
      );

      if (!updatedUser) {
         return sendResponse(res, 404, { message: 'Profile not found' });
      }

      return sendResponse(res, 200, {
        message: 'Avatar uploaded successfully',
      });
    } catch (error) {
      console.error(error);
      return sendResponse(res, 500, {
        message: 'Error loading avatar',
      });
    }
  }

  // Метод получения аватара
  public async getAvatar(
    req: Request,
    res: Response
  ): Promise< void> {
    try {
      if (!req.user) {
       
       return sendResponse(res, 401, { message: 'User is not authorized' });
      }

      const user = await UserProfile.findOne({ user: req.user.id });

      if (!user || !user.avatar) {
        return sendResponse(res, 404, { message: 'Avatar not found' });
      }

      res.set('Content-Type', user.avatarContentType as string);
      res.send(user.avatar);
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, { message: 'Error getting avatar' });
    }
  }
}

export default new AvatarController();
