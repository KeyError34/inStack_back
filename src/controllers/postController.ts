import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Post from '../models/Post';
import UserProfile from '../models/UserProfile';
import { IUserProfile } from '../models/UserProfile';
import User from '../models/User';
import { IPost } from '../models/Post';
import { Types } from 'mongoose';
import { FileCompressor } from '../utils/fileCompressor';
import { FileUploader } from '../utils/fileUplouder';
import { sendResponse } from '../utils/responseUtils';
import { extractPublicId } from '../utils/extractPublicId';



export interface IFormattedPost {
  _id: Types.ObjectId;
  content: string;
  imageUrls: string[];
  videoUrl: string;
  createdAt: Date | string;
  user: {
    username: string;
    avatar?: string;
  };
  likesCount: number;
}
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

  public async getPost(req: Request, res: Response): Promise<void> {
    try {
      console.log('Registered models:', mongoose.modelNames());
      const { postId } = req.params;

      console.log('Received postId:', postId);

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        console.log('Invalid post ID:', postId);
        return sendResponse(res, 400, { message: 'Invalid post ID' });
      }

      const post = await Post.findById(postId)
        .populate('user', 'username profile') // Подтягиваем данные пользователя, создавшего пост
        .populate({
          path: 'comments',
          populate: [
            {
              path: 'user',
              select: 'username profile',
              populate: { path: 'profile', select: 'avatar' },
            }, // Данные пользователя, оставившего комментарий
            {
              path: 'replies',
              select: 'content user',
              populate: { path: 'user', select: 'username' },
            }, // Ответы на комментарии
          ],
        })
        .populate({
          path: 'likes',
          select: 'username profile',
          populate: { path: 'profile', select: 'avatar' },
        })
        .sort({ createdAt: -1 })
        .exec();

      if (!post) {
        return sendResponse(res, 404, { message: 'Post not found' });
      }

      return sendResponse(res, 200, {
        message: 'Post retrieved successfully',
        data: post,
      });
    } catch (error) {
      console.error('Error retrieving post:', error);
      return sendResponse(res, 500, {
        message: 'Error retrieving post',
        data: { error },
      });
    }
  }


  public async getAllUserPost(req: Request, res: Response): Promise<void> {
    try {
      // Получаем имя пользователя из параметров URL
      const { username } = req.params;

      if (!username) {
        sendResponse(res, 400, { message: 'Username is required' });
        return;
      }

      // Ищем пользователя по имени пользователя
      const user = await User.findOne({ username }).select(
        '_id username profile'
      );
      if (!user) {
        sendResponse(res, 404, { message: 'User not found' });
        return;
      }

      // Ищем посты, созданные этим пользователем
      const userPosts = await Post.find({ user: user._id })
        .populate('user', 'username profile') // Подтягиваем данные пользователя, создавшего пост
        .populate({
          path: 'comments',
          populate: [
            {
              path: 'user',
              select: 'username profile',
              populate: { path: 'profile', select: 'avatar' },
            }, // Данные пользователя, оставившего комментарий
            {
              path: 'replies',
              select: 'content user',
              populate: { path: 'user', select: 'username' },
            }, // Ответы на комментарии
          ],
        })
        .sort({ createdAt: -1 })
        .exec();

      // Форматируем данные: преобразуем likes в массив строковых ID
      const formattedPosts = userPosts.map((post) => ({
        ...post.toObject(),
        likes: post.likes.map((like: any) => like._id.toString()), // Преобразование объектов в строки
      }));
      console.log(formattedPosts)
      sendResponse(res, 200, {message:'user post', data: formattedPosts });
    } catch (error) {
      console.error('Error fetching user posts:', error);
      sendResponse(res, 500, { message: 'Internal Server Error' });
    }
  }

  public async getPostsForFollowing(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        sendResponse(res, 400, { message: 'User ID is required' });
        return;
      }

      const userProfile = await UserProfile.findOne({
        user: currentUserId,
      }).populate('following');

      if (!userProfile) {
        sendResponse(res, 404, { message: 'User profile not found' });
        return;
      }

      const followingUsers = userProfile.following;

      if (!followingUsers.length) {
        sendResponse(res, 200, {
          message: 'No posts found',
          data: { posts: [] },
        });
        return;
      }

      const posts = await Post.find({ user: { $in: followingUsers } })
        .sort({ createdAt: -1 })
        .populate('user', 'username avatar') // Заполняем данные пользователя
        .lean();

      const formattedPosts = posts.map((post) => ({
        _id: post._id,
        content: post.content || '',
        imageUrls: post.imageUrls || [],
        videoUrl: post.videoUrl || '',
        createdAt: post.createdAt.toISOString(),
        user: post.user,
        likesCount: post.likesCount,
        likes: post.likes.map((likeId) => likeId.toString()), // Преобразуем ObjectId в строки
      }));
      console.log(formattedPosts);
      sendResponse(res, 200, {
        message: 'Posts fetched successfully',
        data: { posts: formattedPosts },
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      sendResponse(res, 500, { message: 'Server error' });
    }
  }

  public async editPost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;
      const { content, videoUrl } = req.body;
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
  public async toggleLike(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      const post = await Post.findById(postId);
      if (!post) {
        return sendResponse(res, 404, { message: 'Post not found' });
      }

      // Если лайк уже поставлен — удаляем лайк
      if (userId && post.likes.includes(new Types.ObjectId(userId))) {
        // Удаляем лайк и уменьшаем счетчик
        post.likes = post.likes.filter((like) => like.toString() !== userId);
        post.likesCount -= 1;
      } else {
        // Если лайк не поставлен — добавляем лайк и увеличиваем счетчик
        post.likes.push(new Types.ObjectId(userId));
        post.likesCount += 1;
      }

      await post.save();

      return sendResponse(res, 200, {
        message: post.likes.includes(new Types.ObjectId(userId))
          ? 'Post liked successfully'
          : 'Post unliked successfully',
        data: post,
      });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Error toggling like' });
    }
  }
  public async addRepost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      const post = await Post.findById(postId);
      if (!post) {
        return sendResponse(res, 404, { message: 'Post not found' });
      }

      // Проверка, если пост уже был репостнут этим пользователем
      if (post.reposts.includes(new Types.ObjectId(userId))) {
        return sendResponse(res, 400, {
          message: 'You have already reposted this post',
        });
      }

      // Добавляем репост и увеличиваем счетчик
      post.reposts.push(new Types.ObjectId(userId));
      post.repostsCount += 1;
      await post.save();

      // Теперь добавляем этот пост в репосты профиля пользователя
      const userProfile = await UserProfile.findOne({ user: userId });
      if (!userProfile) {
        return sendResponse(res, 404, { message: 'User profile not found' });
      }

      // Добавляем пост в массив repostedPosts, если его там нет
      if (!userProfile.repostedPosts.includes(new Types.ObjectId(userId))) {
        userProfile.repostedPosts.push(new Types.ObjectId(userId));
        await userProfile.save();
      }

      return sendResponse(res, 200, {
        message: 'Post reposted successfully',
        data: post,
      });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Error adding repost' });
    }
  }
}

export default new PostController();
