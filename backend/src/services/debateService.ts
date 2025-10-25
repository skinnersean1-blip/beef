import { PrismaClient, DebateStatus } from '@prisma/client';
import { CreateDebateDTO, AcceptDebateDTO } from '../types';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class DebateService {
  async createDebate(userId: string, data: CreateDebateDTO) {
    // Check user wallet balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.walletBalance < data.initialAnte) {
      throw new AppError('Insufficient wallet balance', 400);
    }

    // Create debate and deduct ante from wallet
    const debate = await prisma.$transaction(async (tx) => {
      const newDebate = await tx.debate.create({
        data: {
          topic: data.topic,
          description: data.description,
          category: data.category,
          initialAnte: data.initialAnte,
          totalPot: data.initialAnte,
          creatorPosition: data.creatorPosition,
          creatorId: userId,
          status: 'OPEN',
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      });

      // Deduct ante from wallet
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: { decrement: data.initialAnte },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          type: 'DEBATE_ANTE',
          amount: -data.initialAnte,
          balance: user.walletBalance - data.initialAnte,
          description: `Ante for debate: ${data.topic}`,
          relatedDebateId: newDebate.id,
        },
      });

      return newDebate;
    });

    return debate;
  }

  async acceptDebate(userId: string, debateId: string, data: AcceptDebateDTO) {
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      include: { creator: true },
    });

    if (!debate) {
      throw new AppError('Debate not found', 404);
    }

    if (debate.status !== 'OPEN') {
      throw new AppError('Debate is not open for challenges', 400);
    }

    if (debate.creatorId === userId) {
      throw new AppError('Cannot challenge your own debate', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.walletBalance < data.challengerAnte) {
      throw new AppError('Insufficient wallet balance', 400);
    }

    // Accept debate and start it
    const updatedDebate = await prisma.$transaction(async (tx) => {
      const updated = await tx.debate.update({
        where: { id: debateId },
        data: {
          challengerId: userId,
          challengerPosition: data.challengerPosition,
          challengerAnte: data.challengerAnte,
          totalPot: { increment: data.challengerAnte },
          status: 'ACTIVE',
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          challenger: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      });

      // Deduct ante from challenger's wallet
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: { decrement: data.challengerAnte },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          type: 'DEBATE_ANTE',
          amount: -data.challengerAnte,
          balance: user.walletBalance - data.challengerAnte,
          description: `Ante for debate: ${debate.topic}`,
          relatedDebateId: debateId,
        },
      });

      // Notify creator
      await tx.notification.create({
        data: {
          userId: debate.creatorId,
          type: 'debate_accepted',
          title: 'Debate Accepted!',
          message: `${user.username} has accepted your debate challenge`,
          link: `/debates/${debateId}`,
        },
      });

      return updated;
    });

    return updatedDebate;
  }

  async getDebates(filters: {
    status?: DebateStatus;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const { status, category, search, limit = 20, offset = 0 } = filters;

    const where: any = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { topic: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [debates, total] = await Promise.all([
      prisma.debate.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          challenger: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
              votes: true,
              bets: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.debate.count({ where }),
    ]);

    return { debates, total, limit, offset };
  }

  async getDebateById(debateId: string, userId?: string) {
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        challenger: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
            votes: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        votes: true,
        bets: userId
          ? {
              where: { userId },
            }
          : false,
        _count: {
          select: {
            comments: true,
            votes: true,
            bets: true,
          },
        },
      },
    });

    if (!debate) {
      throw new AppError('Debate not found', 404);
    }

    return debate;
  }

  async extendDebate(userId: string, debateId: string, additionalAnte: number) {
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
    });

    if (!debate) {
      throw new AppError('Debate not found', 404);
    }

    if (debate.creatorId !== userId && debate.challengerId !== userId) {
      throw new AppError('Only debate participants can extend the debate', 403);
    }

    if (debate.status !== 'ACTIVE') {
      throw new AppError('Can only extend active debates', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.walletBalance < additionalAnte) {
      throw new AppError('Insufficient wallet balance', 400);
    }

    const updatedDebate = await prisma.$transaction(async (tx) => {
      const updated = await tx.debate.update({
        where: { id: debateId },
        data: {
          totalPot: { increment: additionalAnte },
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          extendedTimes: { increment: 1 },
          status: 'EXTENDED',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: additionalAnte } },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'DEBATE_ANTE',
          amount: -additionalAnte,
          balance: user.walletBalance - additionalAnte,
          description: `Extended debate: ${debate.topic}`,
          relatedDebateId: debateId,
        },
      });

      return updated;
    });

    return updatedDebate;
  }
}
