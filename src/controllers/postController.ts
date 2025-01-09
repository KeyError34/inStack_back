// тут this.uploadToCloudinary this не сработает
// ну или нужно будет сделать один экземпляр и использовать его
// и получается что вызывается статик метод который дергает обычный
//  метод а так как экземпляра конкретного нет то нет и контекста
// например обработки вынести
// и обращается к uploadToCloudinary либо как к статик методу
//  но тогда его нужно будет сделать статик либо иерархию классов
//  поменять поскольку ты все равно ооп пишешь

import { Request, Response } from 'express';
import Post from '../models/Post';
import { FileCompressor } from '../utils/fileCompressor';
import { FileUploader } from '../utils/fileUplouder';
import { sendResponse } from '../utils/responseUtils';
class PostController {
  // Создание поста
  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const imageUrls: string[] = [];
      let videoUrl: string | undefined = '';

      // Проверяем наличие файлов в запросе
      if (req.files && typeof req.files === 'object') {
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };
        console.log(files);

        // Обработка изображений
        if (files['images']) {
          const images = files['images'];
          for (const image of images) {
            const compressedImage = await FileCompressor.compressImage(
              image.buffer
            );
            const imageUploadUrl = await FileUploader.uploadToCloudinary(
              compressedImage,
              'image'
            );
            if (imageUploadUrl) imageUrls.push(imageUploadUrl);
          }
        }

        // Обработка видео
        if (files['video']) {
          const video = files['video'][0];
          const compressedVideo = await FileCompressor.compressVideo(
            video.buffer
          );
          const videoUploadUrl = await FileUploader.uploadToCloudinary(
            compressedVideo,
            'video'
          );
          if (videoUploadUrl) videoUrl = videoUploadUrl;
        }
      }

      // Если не загружены изображения или видео, отправляем ошибку
      if (imageUrls.length === 0 && !videoUrl) {
        return sendResponse(res, 400, {
          message: 'No images or videos uploaded',
        });
      }

      // Создание поста с возможностью добавления URL изображений и видео
      const post = new Post({
        user: req.user?.id,
        content: req.body.content,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        videoUrl: videoUrl ?? undefined,
        likesCount: 0,
        comments: [],
        reposts: [],
      });

      await post.save();

      return sendResponse(res, 201, {
        message: 'Post successfully created',
        data: post,
      });
    } catch (error) {
      console.error('Error creating post:', error);
      return sendResponse(res, 500, {
        message: 'Error creating post',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
}

export default new PostController();
