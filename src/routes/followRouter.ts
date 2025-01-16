import express from 'express';
import followController from '../controllers/followController';
import jwtMiddleware from '../middlewares/jwtMiddleware';

const router = express.Router();

// Получить список подписок
router.get(
  '/following',
 jwtMiddleware,
  followController.getFollowingUsers
);

// Получить список подписчиков
router.get(
  '/followers',
  jwtMiddleware,
  followController.getFollowers
);

// Подписаться/отписаться
router.post(
  '/follow/:username',
  jwtMiddleware,
 followController.toggleFollow
);

export default router;
