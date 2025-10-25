import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { BettingService } from '../services/bettingService';

const bettingService = new BettingService();

export class BetController {
  async placeBet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { debateId } = req.params;
      const { amount, predictedWinner } = req.body;

      if (!amount || !predictedWinner) {
        return res.status(400).json({ error: 'Amount and predicted winner are required' });
      }

      const bet = await bettingService.placeBet(userId, debateId, {
        amount: parseFloat(amount),
        predictedWinner,
      });

      res.status(201).json(bet);
    } catch (error) {
      next(error);
    }
  }

  async getUserBets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { status } = req.query;

      const bets = await bettingService.getUserBets(userId, status as string);

      res.json(bets);
    } catch (error) {
      next(error);
    }
  }

  async getDebateOdds(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { debateId, predictedWinner } = req.params;

      const odds = await bettingService.calculateOdds(debateId, predictedWinner);

      res.json({ odds });
    } catch (error) {
      next(error);
    }
  }
}
