import { PrismaClient } from '@prisma/client';
import { CrowdEngagementMetrics } from '../types';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class CrowdEngagementService {
  /**
   * Calculate crowd engagement metrics for a debate
   */
  async calculateEngagementMetrics(debateId: string): Promise<CrowdEngagementMetrics> {
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      include: {
        votes: true,
        comments: {
          include: {
            votes: true,
          },
        },
      },
    });

    if (!debate) {
      throw new AppError('Debate not found', 404);
    }

    // Count support votes for each participant
    const creatorSupportVotes = debate.votes.filter(
      (v) => v.type === 'SUPPORT_CREATOR'
    ).length;

    const challengerSupportVotes = debate.votes.filter(
      (v) => v.type === 'SUPPORT_CHALLENGER'
    ).length;

    // Calculate engagement from comments
    const creatorComments = debate.comments.filter(
      (c) => c.authorId === debate.creatorId
    );
    const challengerComments = debate.comments.filter(
      (c) => c.authorId === debate.challengerId
    );

    // Calculate upvote ratio for each participant's comments
    const creatorUpvotes = creatorComments.reduce(
      (sum, comment) =>
        sum + comment.votes.filter((v) => v.type === 'UPVOTE').length,
      0
    );

    const creatorDownvotes = creatorComments.reduce(
      (sum, comment) =>
        sum + comment.votes.filter((v) => v.type === 'DOWNVOTE').length,
      0
    );

    const challengerUpvotes = challengerComments.reduce(
      (sum, comment) =>
        sum + comment.votes.filter((v) => v.type === 'UPVOTE').length,
      0
    );

    const challengerDownvotes = challengerComments.reduce(
      (sum, comment) =>
        sum + comment.votes.filter((v) => v.type === 'DOWNVOTE').length,
      0
    );

    // Calculate weighted scores
    const creatorScore =
      creatorSupportVotes * 2 + // Direct support votes weighted higher
      creatorUpvotes * 1 -
      creatorDownvotes * 0.5;

    const challengerScore =
      challengerSupportVotes * 2 +
      challengerUpvotes * 1 -
      challengerDownvotes * 0.5;

    const totalVotes = creatorSupportVotes + challengerSupportVotes;
    const totalEngagement = totalVotes + creatorUpvotes + challengerUpvotes;

    // Calculate support percentages
    const creatorSupport =
      totalVotes > 0 ? (creatorSupportVotes / totalVotes) * 100 : 50;
    const challengerSupport =
      totalVotes > 0 ? (challengerSupportVotes / totalVotes) * 100 : 50;

    // Determine winner if there's overwhelming support (>65%)
    let winner: 'CREATOR' | 'CHALLENGER' | undefined;
    if (creatorSupport > 65) {
      winner = 'CREATOR';
    } else if (challengerSupport > 65) {
      winner = 'CHALLENGER';
    }

    return {
      creatorSupport,
      challengerSupport,
      totalVotes,
      engagementScore: totalEngagement,
      winner,
    };
  }

  /**
   * Check if debate should be auto-decided based on crowd engagement
   */
  async checkForCrowdDecision(debateId: string): Promise<{
    shouldDecide: boolean;
    winner?: string;
    metrics: CrowdEngagementMetrics;
  }> {
    const metrics = await this.calculateEngagementMetrics(debateId);
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
    });

    if (!debate) {
      throw new AppError('Debate not found', 404);
    }

    // Require minimum engagement before auto-deciding
    const minimumVotes = 20;
    const overwhelmingThreshold = 70; // 70% support

    if (metrics.totalVotes < minimumVotes) {
      return {
        shouldDecide: false,
        metrics,
      };
    }

    let winnerId: string | undefined;

    if (metrics.creatorSupport > overwhelmingThreshold) {
      winnerId = debate.creatorId;
    } else if (metrics.challengerSupport > overwhelmingThreshold) {
      winnerId = debate.challengerId;
    }

    return {
      shouldDecide: !!winnerId,
      winner: winnerId,
      metrics,
    };
  }

  /**
   * Get top spectator comments (most engagement)
   */
  async getTopSpectatorComments(debateId: string, limit: number = 10) {
    const comments = await prisma.comment.findMany({
      where: {
        debateId,
        type: 'SPECTATOR',
      },
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
        _count: {
          select: {
            votes: true,
            replies: true,
          },
        },
      },
    });

    // Sort by engagement score
    const scored = comments.map((comment) => {
      const upvotes = comment.votes.filter((v) => v.type === 'UPVOTE').length;
      const downvotes = comment.votes.filter((v) => v.type === 'DOWNVOTE').length;
      const score = upvotes - downvotes * 0.5 + comment._count.replies * 0.3;

      return { ...comment, engagementScore: score };
    });

    scored.sort((a, b) => b.engagementScore - a.engagementScore);

    return scored.slice(0, limit);
  }

  /**
   * Get debate statistics
   */
  async getDebateStats(debateId: string) {
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      include: {
        comments: true,
        votes: true,
        bets: true,
      },
    });

    if (!debate) {
      throw new AppError('Debate not found', 404);
    }

    const metrics = await this.calculateEngagementMetrics(debateId);

    const creatorComments = debate.comments.filter(
      (c) => c.authorId === debate.creatorId && c.type !== 'SPECTATOR'
    ).length;

    const challengerComments = debate.comments.filter(
      (c) => c.authorId === debate.challengerId && c.type !== 'SPECTATOR'
    ).length;

    const spectatorComments = debate.comments.filter(
      (c) => c.type === 'SPECTATOR'
    ).length;

    const totalBetAmount = debate.bets.reduce((sum, bet) => sum + bet.amount, 0);

    const creatorBets = debate.bets.filter(
      (b) => b.predictedWinner === debate.creatorId
    );
    const challengerBets = debate.bets.filter(
      (b) => b.predictedWinner === debate.challengerId
    );

    return {
      engagement: metrics,
      comments: {
        creator: creatorComments,
        challenger: challengerComments,
        spectators: spectatorComments,
        total: debate.comments.length,
      },
      betting: {
        totalAmount: totalBetAmount,
        creatorBets: {
          count: creatorBets.length,
          amount: creatorBets.reduce((sum, b) => sum + b.amount, 0),
        },
        challengerBets: {
          count: challengerBets.length,
          amount: challengerBets.reduce((sum, b) => sum + b.amount, 0),
        },
      },
      pot: debate.totalPot,
    };
  }
}
