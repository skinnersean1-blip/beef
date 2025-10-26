import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BettingService {
  async placeBet(userId: string, debateId: string, predictedWinner: string, amount: number) {
    return await prisma.$transaction(async (tx: any) => {
      // Get user
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.walletBalance < amount) {
        throw new Error('Insufficient funds');
      }

      // Get debate
      const debate = await tx.debate.findUnique({
        where: { id: debateId },
      });

      if (!debate) {
        throw new Error('Debate not found');
      }

      if (debate.status !== 'ACTIVE') {
        throw new Error('Debate is not active');
      }

      // Calculate odds
      const odds = await this.calculateOdds(debateId, predictedWinner);

      // Create bet
      const bet = await tx.bet.create({
        data: {
          userId,
          debateId,
          predictedWinner,
          amount,
          odds,
        },
      });

      // Deduct from wallet
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: user.walletBalance - amount,
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          debateId,
          amount: -amount,
          type: 'BET_PLACED',
          description: `Bet on debate: ${debate.topic}`,
        },
      });

      // Update debate pot
      await tx.debate.update({
        where: { id: debateId },
        data: {
          totalPot: debate.totalPot + amount,
        },
      });

      return bet;
    });
  }

  async calculateOdds(debateId: string, predictedWinner: string): Promise<number> {
    const bets = await prisma.bet.findMany({
      where: { debateId },
    });

    if (bets.length === 0) {
      return 2.0; // Default odds
    }

    const totalAmount = bets.reduce((sum: any, bet: any) => sum + bet.amount, 0);
    const winnerAmount = bets
      .filter((bet: any) => bet.predictedWinner === predictedWinner)
      .reduce((sum: any, bet: any) => sum + bet.amount, 0);

    if (winnerAmount === 0) {
      return 5.0; // High odds if no one bet on this outcome
    }

    const odds = totalAmount / winnerAmount;
    return Math.max(1.1, Math.min(odds, 10)); // Between 1.1x and 10x
  }

  async distributeBetWinnings(debateId: string, winnerId: string) {
    return await prisma.$transaction(async (tx: any) => {
      const winningBets = await tx.bet.findMany({
        where: {
          debateId,
          predictedWinner: winnerId,
        },
      });

      for (const bet of winningBets) {
        const winnings = bet.amount * bet.odds;

        // Add to wallet
        await tx.user.update({
          where: { id: bet.userId },
          data: {
            walletBalance: {
              increment: winnings,
            },
          },
        });

        // Create transaction record
        await tx.transaction.create({
          data: {
            userId: bet.userId,
            debateId,
            amount: winnings,
            type: 'BET_WON',
            description: `Won bet on debate`,
          },
        });
      }

      // Handle losing bets
      const losingBets = await tx.bet.findMany({
        where: {
          debateId,
          NOT: {
            predictedWinner: winnerId,
          },
        },
      });

      for (const bet of losingBets) {
        await tx.transaction.create({
          data: {
            userId: bet.userId,
            debateId,
            amount: 0,
            type: 'BET_LOST',
            description: `Lost bet on debate`,
          },
        });
      }
    });
  }
}
