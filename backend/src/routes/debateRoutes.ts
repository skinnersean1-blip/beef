import { Router } from 'express';
import { DebateController } from '../controllers/debateController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();
const debateController = new DebateController();

router.post('/', authenticate, debateController.createDebate.bind(debateController));
router.get('/', optionalAuth, debateController.getDebates.bind(debateController));
router.get('/:id', optionalAuth, debateController.getDebateById.bind(debateController));
router.post('/:id/accept', authenticate, debateController.acceptDebate.bind(debateController));
router.post('/:id/extend', authenticate, debateController.extendDebate.bind(debateController));
router.post('/:id/end', authenticate, debateController.endDebate.bind(debateController));
router.get('/:id/stats', debateController.getDebateStats.bind(debateController));

export default router;
