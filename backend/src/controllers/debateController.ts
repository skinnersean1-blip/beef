import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { DebateService } from '../services/debateService';
import { CrowdEngagementService } from '../services/crowdEngagementService';
import { AIService } from '../services/aiService';
import { BettingService } from '../services/bettingService';
import { PrismaClient } from '@prisma/client';

const debateService = new DebateService();
const crowdService = new CrowdEngagementService();
const aiService = new AIService();
const bettingService = new BettingService();
const prisma = new PrismaClient();

export class DebateController {
  async createDebate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { topic, description, category, initialAnte, creatorPosition } = req.body;

      if (!topic || !description || !category || !initialAnte || !creatorPosition) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const debate = await debateService.createDebate(userId, {
        topic,
        description,
        category,
        initialAnte: parseFloat(initialAnte),
        creatorPosition,
      });

      res.status(201).json(debate);
    } catch (error) {
      next(error);
    }
  }

  async getDebates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, category, search, limit, offset } = req.query;

      const debates = await debateService.getDebates({
        status: status as any,
        category: category as string,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json(debates);
    } catch (error) {
      next(error);
    }
  }

  async getDebateById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const debate = await debateService.getDebateById(id, userId);

      res.json(debate);
    } catch (error) {
      next(error);
    }
  }

  async acceptDebate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { challengerPosition, challengerAnte } = req.body;

      if (!challengerPosition || !challengerAnte) {
        return res.status(400).json({ error: 'Position and ante are required' });
      }

      const debate = await debateService.acceptDebate(userId, id, {
        challengerPosition,
        challengerAnte: parseFloat(challengerAnte),
      });

      res.json(debate);
    } catch (error) {
      next(error);
    }
  }

  async extendDebate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { additionalAnte } = req.body;

      if (!additionalAnte) {
        return res.status(400).json({ error: 'Additional ante is required' });
      }

      const debate = await debateService.extendDebate(
        userId,
        id,
        parseFloat(additionalAnte)
      );

      res.json(debate);
    } catch (error) {
      next(error);
    }
  }

  async getDebateStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await crowdService.getDebateStats(id);

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async endDebate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { useAI } = req.body;

      const debate = await prisma.debate.findUnique({
        where: { id },
        include: {
          comments: {
            include: {
              author: true,
            },
          },
        },
      });

      if (!debate) {
        return res.status(404).json({ error: 'Debate not found' });
      }

      if (debate.creatorId !== userId && debate.challengerId !== userId) {
        return res.status(403).json({ error: 'Only participants can end debate' });
      }

      let winnerId: string | undefined;
      let determination: string;

      // Check crowd decision first
      const crowdDecision = await crowdService.checkForCrowdDecision(id);

      if (crowdDecision.shouldDecide && crowdDecision.winner) {
        winnerId = crowdDecision.winner;
        determination = 'CROWD_SUPPORT';
      } else if (useAI) {
        // Use AI fact-checking
        const creatorComments = debate.comments
          .filter((c) => c.authorId === debate.creatorId)
          .map((c) => c.content);

        const challengerComments = debate.comments
          .filter((c) => debate.challengerId && c.authorId === debate.challengerId)
          .map((c) => c.content);

        const aiResult = await aiService.factCheckDebate(
          debate.topic,
          creatorComments,
          challengerComments,
          debate.creatorPosition,
          debate.challengerPosition || ''
        );

        if (aiResult.determination === 'CREATOR') {
          winnerId = debate.creatorId;
        } else if (aiResult.determination === 'CHALLENGER') {
          winnerId = debate.challengerId;
        }

        determination = 'AI_VERIFICATION';

        // Save AI results
        await prisma.debate.update({
          where: { id },
          data: {
            aiFactCheckScore: aiResult as any,
          },
        });
      } else {
        return res.status(400).json({
          error: 'No clear winner. Use AI verification or wait for crowd decision.',
        });
      }

      if (!winnerId) {
        return res.status(400).json({ error: 'Could not determine winner' });
      }

      // Update debate status
      const updatedDebate = await prisma.debate.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          winnerId,
          winnerDetermination: determination as any,
        },
      });

      // Settle all bets
      await bettingService.settleBets(id, winnerId);

      // Award pot to winner
      await prisma.user.update({
        where: { id: winnerId },
        data: {
          walletBalance: { increment: debate.totalPot },
        },
      });

      await prisma.transaction.create({
        data: {
          userId: winnerId,
          type: 'DEBATE_WINNINGS',
          amount: debate.totalPot,
          balance: 0,
          description: `Won debate: ${debate.topic}`,
          relatedDebateId: id,
        },
      });

      // Notify participants
      await prisma.notification.create({
        data: {
          userId: winnerId,
          type: 'debate_won',
          title: 'Debate Won!',
          message: `You won the debate and $${debate.totalPot}!`,
          link: `/debates/${id}`,
        },
      });

      const loserId =
        winnerId === debate.creatorId ? debate.challengerId : debate.creatorId;

      if (loserId) {
        await prisma.notification.create({
          data: {
            userId: loserId,
            type: 'debate_lost',
            title: 'Debate Ended',
            message: `The debate has ended`,
            link: `/debates/${id}`,
          },
        });
      }

      res.json(updatedDebate);
    } catch (error) {
      next(error);
    }
  }
}
