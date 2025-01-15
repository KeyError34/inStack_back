import commentController from '../controllers/commentController';
import jwtMiddleware from '../middlewares/jwtMiddleware';
import { Router } from 'express';
const router: Router = Router();

router.post('/post/:postId/comment', jwtMiddleware, commentController.addComment);
router.put('/comment/:commentId', jwtMiddleware, commentController.editComment);
router.delete('/comment/:commentId', jwtMiddleware, commentController.deleteComment);
export default router;
