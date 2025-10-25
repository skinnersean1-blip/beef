import { Router } from 'express';
import { BetController } from '../controllers/betController';
import { authenticate } from '../middleware/auth';

const router = Router();
const betController = new BetController();

router.post('/debates/:debateId/bets', authenticate, betController.placeBet.bind(betController));
router.get('/bets', authenticate, betController.getUserBets.bind(betController));
router.get('/debates/:debateId/odds/:predictedWinner', betController.getDebateOdds.bind(betController));

export default router;
