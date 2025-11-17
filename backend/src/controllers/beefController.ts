import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const MAX_ANTE = 1000;
const WORD_LIMIT = 500;
const DEBATE_DURATION_HOURS = 24;

// Create a new beef
export const createBeef = async (req: AuthRequest, res: Response) => {
  try {
    const { topic, creatorPosition, ante } = req.body;
    const userId = req.user!.userId;

    if (!topic || !creatorPosition || !ante) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (ante > MAX_ANTE) {
      return res.status(400).json({ error: `Maximum ante is $${MAX_ANTE}` });
    }

    if (ante < 1) {
      return res.status(400).json({ error: 'Minimum ante is $1' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || user.walletBalance < ante) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create beef and deduct ante into escrow
    const beef = await prisma.$transaction(async (tx) => {
      const newBeef = await tx.beef.create({
        data: {
          topic,
          creatorPosition,
          ante,
          creatorId: userId,
          status: 'OPEN',
        },
      });

      // Deduct from wallet
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: user.walletBalance - ante },
      });

      // Record escrow transaction
      await tx.transaction.create({
        data: {
          userId,
          beefId: newBeef.id,
          amount: -ante,
          type: 'ESCROW_HOLD',
          description: `Ante for: ${topic}`,
        },
      });

      return newBeef;
    });

    res.status(201).json(beef);
  } catch (error) {
    console.error('Create beef error:', error);
    res.status(500).json({ error: 'Failed to create beef' });
  }
};

// Accept a beef
export const acceptBeef = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { challengerPosition } = req.body;
    const userId = req.user!.userId;

    if (!challengerPosition) {
      return res.status(400).json({ error: 'Challenger position required' });
    }

    const beef = await prisma.beef.findUnique({ where: { id } });

    if (!beef) {
      return res.status(404).json({ error: 'Beef not found' });
    }

    if (beef.status !== 'OPEN') {
      return res.status(400).json({ error: 'Beef is not open' });
    }

    if (beef.creatorId === userId) {
      return res.status(400).json({ error: 'Cannot accept your own beef' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.walletBalance < beef.ante) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Accept beef and place matching ante into escrow
    const updatedBeef = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const endsAt = new Date(now.getTime() + DEBATE_DURATION_HOURS * 60 * 60 * 1000);

      const updated = await tx.beef.update({
        where: { id },
        data: {
          challengerId: userId,
          challengerPosition,
          status: 'ACTIVE',
          startsAt: now,
          endsAt,
        },
      });

      // Deduct from wallet
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: user.walletBalance - beef.ante },
      });

      // Record escrow transaction
      await tx.transaction.create({
        data: {
          userId,
          beefId: id,
          amount: -beef.ante,
          type: 'ESCROW_HOLD',
          description: `Accepted beef: ${beef.topic}`,
        },
      });

      return updated;
    });

    res.json(updatedBeef);
  } catch (error) {
    console.error('Accept beef error:', error);
    res.status(500).json({ error: 'Failed to accept beef' });
  }
};

// Add post to beef
export const addPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    const beef = await prisma.beef.findUnique({ where: { id } });

    if (!beef) {
      return res.status(404).json({ error: 'Beef not found' });
    }

    if (beef.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Beef is not active' });
    }

    if (beef.creatorId !== userId && beef.challengerId !== userId) {
      return res.status(403).json({ error: 'Only debaters can post' });
    }

    // Count words
    const wordCount = content.trim().split(/\s+/).length;

    if (wordCount > WORD_LIMIT) {
      return res.status(400).json({ error: `Maximum ${WORD_LIMIT} words per post` });
    }

    const post = await prisma.post.create({
      data: {
        content,
        wordCount,
        authorId: userId,
        beefId: id,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Add post error:', error);
    res.status(500).json({ error: 'Failed to add post' });
  }
};

// Withdraw beef (before acceptance)
export const withdrawBeef = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const beef = await prisma.beef.findUnique({ where: { id } });

    if (!beef) {
      return res.status(404).json({ error: 'Beef not found' });
    }

    if (beef.creatorId !== userId) {
      return res.status(403).json({ error: 'Only creator can withdraw' });
    }

    if (beef.status !== 'OPEN') {
      return res.status(400).json({ error: 'Can only withdraw open beefs' });
    }

    // Return ante and mark withdrawn
    await prisma.$transaction(async (tx) => {
      await tx.beef.update({
        where: { id },
        data: { status: 'WITHDRAWN' },
      });

      const user = await tx.user.findUnique({ where: { id: userId } });

      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: (user?.walletBalance || 0) + beef.ante },
      });

      await tx.transaction.create({
        data: {
          userId,
          beefId: id,
          amount: beef.ante,
          type: 'ESCROW_RETURN',
          description: 'Beef withdrawn',
        },
      });
    });

    res.json({ message: 'Beef withdrawn successfully' });
  } catch (error) {
    console.error('Withdraw beef error:', error);
    res.status(500).json({ error: 'Failed to withdraw beef' });
  }
};

// Concede beef
export const concede = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const beef = await prisma.beef.findUnique({ where: { id } });

    if (!beef) {
      return res.status(404).json({ error: 'Beef not found' });
    }

    if (beef.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Beef is not active' });
    }

    if (beef.creatorId !== userId && beef.challengerId !== userId) {
      return res.status(403).json({ error: 'Only debaters can concede' });
    }

    // Determine winner (opposite of conceder)
    const winnerId = beef.creatorId === userId ? beef.challengerId : beef.creatorId;

    await settleBeef(id, winnerId!, 'CONCESSION');

    res.json({ message: 'Beef conceded successfully' });
  } catch (error) {
    console.error('Concede error:', error);
    res.status(500).json({ error: 'Failed to concede' });
  }
};

// Helper function to settle beef and distribute funds
async function settleBeef(beefId: string, winnerId: string, settlementType: string) {
  await prisma.$transaction(async (tx) => {
    const beef = await tx.beef.findUnique({ where: { id: beefId } });
    if (!beef) throw new Error('Beef not found');

    const totalPot = beef.ante * 2;
    const platformFee = totalPot * 0.01; // 1% fee
    const winnerPayout = totalPot - platformFee;

    // Update beef status
    await tx.beef.update({
      where: { id: beefId },
      data: {
        status: 'COMPLETED',
        winnerId,
        settlementType: settlementType as any,
      },
    });

    // Pay winner
    const winner = await tx.user.findUnique({ where: { id: winnerId } });
    await tx.user.update({
      where: { id: winnerId },
      data: { walletBalance: (winner?.walletBalance || 0) + winnerPayout },
    });

    // Record transactions
    await tx.transaction.create({
      data: {
        userId: winnerId,
        beefId,
        amount: winnerPayout,
        type: 'ESCROW_RELEASE',
        description: `Won beef: ${beef.topic}`,
      },
    });

    await tx.transaction.create({
      data: {
        userId: winnerId,
        beefId,
        amount: -platformFee,
        type: 'PLATFORM_FEE',
        description: '1% platform fee',
      },
    });
  });
}

// Get all beefs (chronological, algorithm-free)
export const getBeefs = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.topic = {
        contains: search as string,
        mode: 'insensitive',
      };
    }

    const beefs = await prisma.beef.findMany({
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
            posts: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Chronological, no algorithm
      },
    });

    res.json(beefs);
  } catch (error) {
    console.error('Get beefs error:', error);
    res.status(500).json({ error: 'Failed to get beefs' });
  }
};

// Get single beef
export const getBeef = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const beef = await prisma.beef.findUnique({
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
        posts: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        likes: true,
      },
    });

    if (!beef) {
      return res.status(404).json({ error: 'Beef not found' });
    }

    res.json(beef);
  } catch (error) {
    console.error('Get beef error:', error);
    res.status(500).json({ error: 'Failed to get beef' });
  }
};

// Like/dislike beef
export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isLike } = req.body;
    const userId = req.user!.userId;

    const existing = await prisma.like.findUnique({
      where: {
        userId_beefId: {
          userId,
          beefId: id,
        },
      },
    });

    if (existing) {
      // Update existing like/dislike
      const updated = await prisma.like.update({
        where: { id: existing.id },
        data: { isLike },
      });
      return res.json(updated);
    }

    // Create new like/dislike
    const like = await prisma.like.create({
      data: {
        userId,
        beefId: id,
        isLike,
      },
    });

    res.status(201).json(like);
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

export { settleBeef };
