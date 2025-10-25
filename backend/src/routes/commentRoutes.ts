import { Router } from 'express';
import { CommentController } from '../controllers/commentController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();
const commentController = new CommentController();

router.post('/debates/:debateId/comments', authenticate, commentController.createComment.bind(commentController));
router.get('/debates/:debateId/comments', optionalAuth, commentController.getComments.bind(commentController));
router.post('/comments/:commentId/vote', authenticate, commentController.voteOnComment.bind(commentController));
router.post('/debates/:debateId/vote', authenticate, commentController.voteOnDebate.bind(commentController));

export default router;
