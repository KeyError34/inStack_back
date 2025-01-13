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
import { extractPublicId } from '../utils/extractPublicId';
class PostController {
  // Создание поста
  public async createPost(req: Request, res: Response): Promise<void> {
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
        likes: [],
        commentsCount: 0,
        comments: [],
        repostsCount: 0,
        reposts: [],
      });

      await post.save();

      return sendResponse(res, 201, {
        message: 'Post successfully created',
        data: { post_id: post._id, ...post.toObject() },
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
  // Получение поста по id
  public async getPost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const post = await Post.findById(postId)
        .populate('user', 'username avatar')
        .populate('comments', 'username avatar')
        .populate('reposts', 'username avatar');
      if (!post) {
        return sendResponse(res, 404, { message: 'Post not found' });
      }
      return sendResponse(res, 200, {
        message: 'Post successfully getted',
        data: post,
      });
    } catch (error) {
      return sendResponse(res, 500, {
        message: 'Error getting post',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
  public async editPost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;
      const { content, imageUrls, videoUrl } = req.body;
      const post = await Post.findById(postId);
      if (!post) {
        return sendResponse(res, 404, { message: 'Post not found' });
      }

      if (post.user.toString() !== userId) {
        return sendResponse(res, 403, {
          message: 'You are not the owner of this post',
        });
      }

      // Обработка файлов (если они есть)
      const updatedImageUrls: string[] = [];
      let updatedVideoUrl: string | undefined = videoUrl;

      if (req.files && typeof req.files === 'object') {
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };
        console.log(files);

        // Обработка новых изображений
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
            if (imageUploadUrl) updatedImageUrls.push(imageUploadUrl);
          }
        }

        // Обработка нового видео
        if (files['video']) {
          const video = files['video'][0];
          const compressedVideo = await FileCompressor.compressVideo(
            video.buffer
          );
          const videoUploadUrl = await FileUploader.uploadToCloudinary(
            compressedVideo,
            'video'
          );
          if (videoUploadUrl) updatedVideoUrl = videoUploadUrl;
        }
      }

      // Обновляем информацию о посте
      post.content = content ?? post.content;
      post.imageUrls =
        updatedImageUrls.length > 0 ? updatedImageUrls : post.imageUrls;
      post.videoUrl = updatedVideoUrl ?? post.videoUrl;

      await post.save();
      return sendResponse(res, 200, {
        message: 'Post updated successfully',
        data: post,
      });
    } catch (error) {
      return sendResponse(res, 500, {
        message: 'Error editing post',
      });
    }
  }

  public async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;
      const post = await Post.findById(postId);

      if (!post) {
        return sendResponse(res, 404, { message: 'Post not found' });
      }

      if (post.user.toString() !== userId) {
        return sendResponse(res, 403, {
          message: 'You are not the owner of this post',
        });
      }

      // Удаление файлов из Cloudinary
      // Удаляем изображения
      if (post.imageUrls && post.imageUrls.length > 0) {
        for (const imageUrl of post.imageUrls) {
          const publicId = extractPublicId(imageUrl);
          if (publicId) {
            await FileUploader.deleteFromCloudinary(publicId);
          }
        }
      }

      // Удаляем видео, если оно есть
      if (post.videoUrl) {
        const publicId = extractPublicId(post.videoUrl);
        if (publicId) {
          await FileUploader.deleteFromCloudinary(publicId);
        }
      }

      // Удаление поста из базы данных
      await post.deleteOne();

      return sendResponse(res, 200, {
        message: 'Post and associated files deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      return sendResponse(res, 500, {
        message: 'Error deleting post',
      });
    }
  }
}

export default new PostController();
