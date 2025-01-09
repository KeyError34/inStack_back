import express from 'express';
import upload from '../middlewares/uploadMiddlewere';
import jwtMiddleware from '../middlewares/jwtMiddleware';
import AvatarController from '../controllers/avatarController'

const router = express.Router();

router.post(
  '/upload-avatar',
  jwtMiddleware,
  upload.single('avatar'),
  AvatarController.uploadAvatar
);
router.get('/avatar', jwtMiddleware, AvatarController.getAvatar);

export default router;
