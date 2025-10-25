import { PrismaClient } from '@prisma/client';
import { PlaceBetDTO } from '../types';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class BettingService {
  async placeBet(userId: string, debateId: string, data: PlaceBetDTO) {
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
    });

    if (!debate) {
      throw new AppError('Debate not found', 404);
    }

    if (debate.status !== 'ACTIVE' && debate.status !== 'EXTENDED') {
      throw new AppError('Can only bet on active debates', 400);
    }

    if (
      data.predictedWinner !== debate.creatorId &&
      data.predictedWinner !== debate.challengerId
    ) {
      throw new AppError('Invalid predicted winner', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.walletBalance < data.amount) {
      throw new AppError('Insufficient wallet balance', 400);
    }

    // Calculate odds based on current bets
    const odds = await this.calculateOdds(debateId, data.predictedWinner);
    const potentialPayout = data.amount * odds;

    const bet = await prisma.$transaction(async (tx) => {
      const newBet = await tx.bet.create({
        data: {
          userId,
          debateId,
          amount: data.amount,
          predictedWinner: data.predictedWinner,
          odds,
          potentialPayout,
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      });

      // Deduct from wallet
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: data.amount } },
      });

      // Create transaction
      await tx.transaction.create({
        data: {
          userId,
          type: 'BET_PLACED',
          amount: -data.amount,
          balance: user.walletBalance - data.amount,
          description: `Bet on debate: ${debate.topic}`,
          relatedDebateId: debateId,
          relatedBetId: newBet.id,
        },
      });

      return newBet;
    });

    return bet;
  }

  async calculateOdds(debateId: string, predictedWinner: string): Promise<number> {
    const bets = await prisma.bet.findMany({
      where: {
        debateId,
        status: 'ACTIVE',
      },
    });

    const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
    const winnerAmount = bets
      .filter((bet) => bet.predictedWinner === predictedWinner)
      .reduce((sum, bet) => sum + bet.amount, 0);

    if (totalAmount === 0) return 2.0; // Default odds
    if (winnerAmount === 0) return 3.0; // High odds for underdog

    const odds = totalAmount / winnerAmount;
    return Math.max(1.1, Math.min(odds, 10)); // Odds between 1.1x and 10x
  }

  async getUserBets(userId: string, status?: string) {
    const where: any = { userId };
    if (status) where.status = status;

    const bets = await prisma.bet.findMany({
      where,
      include: {
        debate: {
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bets;
  }

  async settleBets(debateId: string, winnerId: string) {
    const bets = await prisma.bet.findMany({
      where: {
        debateId,
        status: 'ACTIVE',
      },
    });

    for (const bet of bets) {
      const won = bet.predictedWinner === winnerId;
      const status = won ? 'WON' : 'LOST';
      const payout = won ? bet.potentialPayout : 0;

      await prisma.$transaction(async (tx) => {
        // Update bet status
        await tx.bet.update({
          where: { id: bet.id },
          data: {
            status,
            settledAt: new Date(),
          },
        });

        if (won && payout > 0) {
          // Add winnings to wallet
          await tx.user.update({
            where: { id: bet.userId },
            data: {
              walletBalance: { increment: payout },
            },
          });

          // Create transaction
          await tx.transaction.create({
            data: {
              userId: bet.userId,
              type: 'BET_WON',
              amount: payout,
              balance: 0, // Will be updated by trigger
              description: `Won bet on debate`,
              relatedDebateId: debateId,
              relatedBetId: bet.id,
            },
          });

          // Notify user
          await tx.notification.create({
            data: {
              userId: bet.userId,
              type: 'bet_won',
              title: 'Bet Won!',
              message: `You won $${payout.toFixed(2)} on your bet`,
              link: `/debates/${debateId}`,
            },
          });
        }
      });
    }
  }

  async refundBets(debateId: string) {
    const bets = await prisma.bet.findMany({
      where: {
        debateId,
        status: 'ACTIVE',
      },
    });

    for (const bet of bets) {
      await prisma.$transaction(async (tx) => {
        await tx.bet.update({
          where: { id: bet.id },
          data: {
            status: 'REFUNDED',
            settledAt: new Date(),
          },
        });

        await tx.user.update({
          where: { id: bet.userId },
          data: {
            walletBalance: { increment: bet.amount },
          },
        });

        await tx.transaction.create({
          data: {
            userId: bet.userId,
            type: 'BET_REFUND',
            amount: bet.amount,
            balance: 0,
            description: 'Bet refunded',
            relatedDebateId: debateId,
            relatedBetId: bet.id,
          },
        });
      });
    }
  }
}
