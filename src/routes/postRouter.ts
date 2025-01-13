import postController from '../controllers/postController';
import upload from '../middlewares/uploadMiddlewere';
import { Router } from 'express';
import jwtMiddleware from '../middlewares/jwtMiddleware';

const router: Router = Router();

router.post(
  '/create',
  jwtMiddleware,
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 },
  ]),
  postController.createPost
);
router.get('/:postId', postController.getPost);
router.put(
  '/:postId',
  jwtMiddleware,
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 },
  ]),
  postController.editPost
);
router.delete('/:postId', jwtMiddleware, postController.deletePost)
export default router;
