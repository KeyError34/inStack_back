import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { sendResponse } from '../utils/responseUtils';
import { Types } from 'mongoose'; // Импортируй Types из mongoose

class CommentController {
  // Добавление комментария
  public async addComment(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      const post = await Post.findById(postId);
      if (!post) {
        return sendResponse(res, 404, { message: 'Post not found' });
      }

      const comment = new Comment({ user: userId, post: postId, content });
      await comment.save();

      post.comments.push(comment._id as Types.ObjectId);
      post.commentsCount += 1;
      await post.save();

      return sendResponse(res, 201, {
        message: 'Comment added successfully',
        data: comment,
      });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Error adding comment' });
    }
  }

  // Редактирование комментария
  public async editComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return sendResponse(res, 404, { message: 'Comment not found' });
      }

      if (comment.user.toString() !== userId) {
        return sendResponse(res, 403, {
          message: 'You are not the owner of this comment',
        });
      }

      // Обновляем содержимое комментария
      comment.content = content;
      await comment.save();

      return sendResponse(res, 200, {
        message: 'Comment updated successfully',
        data: comment,
      });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Error updating comment' });
    }
  }

  // Удаление комментария
  public async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = req.user?.id;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return sendResponse(res, 404, { message: 'Comment not found' });
      }

      if (comment.user.toString() !== userId) {
        return sendResponse(res, 403, {
          message: 'You are not the owner of this comment',
        });
      }

      await Comment.deleteOne({ _id: commentId });

      // Уменьшаем счетчик комментариев у поста
      await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: commentId },
        $inc: { commentsCount: -1 },
      });

      return sendResponse(res, 200, {
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Error deleting comment' });
    }
  }
}

export default new CommentController();
