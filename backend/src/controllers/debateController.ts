import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { CrowdEngagementService } from '../services/crowdEngagementService';
import { AIService } from '../services/aiService';
import { BettingService } from '../services/bettingService';

const prisma = new PrismaClient();
const crowdService = new CrowdEngagementService();
const aiService = new AIService();
const bettingService = new BettingService();

// Create a new debate
export const createDebate = async (req: AuthRequest, res: Response) => {
  try {
    const { topic, description, creatorPosition, initialAnte } = req.body;
    const userId = req.user!.userId;

    if (!topic || !creatorPosition || !initialAnte) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (initialAnte < 1) {
      return res.status(400).json({ error: 'Minimum ante is $1' });
    }

    // Check user balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.walletBalance < initialAnte) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Create debate
    const debate = await prisma.debate.create({
      data: {
        topic,
        description,
        creatorId: userId,
        creatorPosition,
        initialAnte,
        totalPot: initialAnte,
        status: 'OPEN',
      },
    });

    // Deduct ante from wallet
    await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: user.walletBalance - initialAnte },
    });

    // Create transaction
    await prisma.transaction.create({
      data: {
        userId,
        debateId: debate.id,
        amount: -initialAnte,
        type: 'ANTE_PLACED',
        description: `Created debate: ${topic}`,
      },
    });

    res.status(201).json(debate);
  } catch (error) {
    console.error('Create debate error:', error);
    res.status(500).json({ error: 'Failed to create debate' });
  }
};

// Accept a debate challenge
export const acceptDebate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { challengerPosition } = req.body;
    const userId = req.user!.userId;

    const debate = await prisma.debate.findUnique({ where: { id } });

    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }

    if (debate.status !== 'OPEN') {
      return res.status(400).json({ error: 'Debate is not open' });
    }

    if (debate.creatorId === userId) {
      return res.status(400).json({ error: 'Cannot challenge your own debate' });
    }

    // Check user balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.walletBalance < debate.initialAnte) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Update debate
    const now = new Date();
    const endsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const updatedDebate = await prisma.debate.update({
      where: { id },
      data: {
        challengerId: userId,
        challengerPosition,
        status: 'ACTIVE',
        startsAt: now,
        endsAt,
        totalPot: debate.totalPot + debate.initialAnte,
      },
    });

    // Deduct ante from challenger wallet
    await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: user.walletBalance - debate.initialAnte },
    });

    // Create transaction
    await prisma.transaction.create({
      data: {
        userId,
        debateId: debate.id,
        amount: -debate.initialAnte,
        type: 'ANTE_PLACED',
        description: `Accepted debate: ${debate.topic}`,
      },
    });

    res.json(updatedDebate);
  } catch (error) {
    console.error('Accept debate error:', error);
    res.status(500).json({ error: 'Failed to accept debate' });
  }
};

// Finalize debate (determine winner)
export const finalizeDebate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { useAI } = req.body;

    const debate = await prisma.debate.findUnique({
      where: { id },
      include: {
        comments: true,
        votes: true,
      },
    });

    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }

    if (debate.status !== 'ACTIVE' && debate.status !== 'EXTENDED') {
      return res.status(400).json({ error: 'Debate is not active' });
    }

    let winnerId: string | undefined;
    let determination: string;

    // Check crowd engagement first
    const crowdDecision = await crowdService.calculateEngagement(id);

    if (crowdDecision.shouldDecide && crowdDecision.winner) {
      winnerId = crowdDecision.winner;
      determination = 'CROWD_SUPPORT';
    } else if (useAI) {
      // Use AI fact-checking
      const creatorComments = debate.comments
        .filter((c: any) => c.authorId === debate.creatorId)
        .map((c: any) => c.content);

      const challengerComments = debate.comments
        .filter((c: any) => debate.challengerId && c.authorId === debate.challengerId)
        .map((c: any) => c.content);

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
        winnerId = debate.challengerId || undefined;
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

    // Update debate with winner
    const finalDebate = await prisma.debate.update({
      where: { id },
      data: {
        winnerId,
        winnerDetermination: determination as any,
        status: 'COMPLETED',
      },
    });

    // Distribute pot to winner
    await prisma.user.update({
      where: { id: winnerId },
      data: {
        walletBalance: {
          increment: debate.totalPot,
        },
      },
    });

    // Create transaction for winner
    await prisma.transaction.create({
      data: {
        userId: winnerId,
        debateId: id,
        amount: debate.totalPot,
        type: 'ANTE_WON',
        description: `Won debate: ${debate.topic}`,
      },
    });

    // Create transaction for loser
    const loserId = winnerId === debate.creatorId ? debate.challengerId : debate.creatorId;
    if (loserId) {
      await prisma.transaction.create({
        data: {
          userId: loserId,
          debateId: id,
          amount: 0,
          type: 'ANTE_LOST',
          description: `Lost debate: ${debate.topic}`,
        },
      });
    }

    // Distribute betting winnings
    await bettingService.distributeBetWinnings(id, winnerId);

    res.json(finalDebate);
  } catch (error) {
    console.error('Finalize debate error:', error);
    res.status(500).json({ error: 'Failed to finalize debate' });
  }
};

// Get all debates
export const getDebates = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.topic = {
        contains: search as string,
        mode: 'insensitive',
      };
    }

    const debates = await prisma.debate.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        challenger: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            comments: true,
            bets: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(debates);
  } catch (error) {
    console.error('Get debates error:', error);
    res.status(500).json({ error: 'Failed to get debates' });
  }
};

// Get single debate
export const getDebate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const debate = await prisma.debate.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        challenger: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
            votes: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        bets: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });

    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }

    res.json(debate);
  } catch (error) {
    console.error('Get debate error:', error);
    res.status(500).json({ error: 'Failed to get debate' });
  }
};

// Add comment to debate
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, type } = req.body;
    const userId = req.user!.userId;

    const debate = await prisma.debate.findUnique({ where: { id } });

    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        type,
        authorId: userId,
        debateId: id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Vote on comment or debate
export const vote = async (req: AuthRequest, res: Response) => {
  try {
    const { value, commentId, debateId } = req.body;
    const userId = req.user!.userId;

    if (!commentId && !debateId) {
      return res.status(400).json({ error: 'Must provide commentId or debateId' });
    }

    // Check for existing vote
    const existing = await prisma.vote.findFirst({
      where: {
        userId,
        ...(commentId ? { commentId } : { debateId }),
      },
    });

    if (existing) {
      // Update existing vote
      const updated = await prisma.vote.update({
        where: { id: existing.id },
        data: { value },
      });
      return res.json(updated);
    }

    // Create new vote
    const vote = await prisma.vote.create({
      data: {
        userId,
        value,
        ...(commentId ? { commentId } : { debateId }),
      },
    });

    res.status(201).json(vote);
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to vote' });
  }
};

// Place bet
export const placeBet = async (req: AuthRequest, res: Response) => {
  try {
    const { debateId, predictedWinner, amount } = req.body;
    const userId = req.user!.userId;

    const bet = await bettingService.placeBet(userId, debateId, predictedWinner, amount);

    res.status(201).json(bet);
  } catch (error: any) {
    console.error('Place bet error:', error);
    res.status(400).json({ error: error.message || 'Failed to place bet' });
  }
};
