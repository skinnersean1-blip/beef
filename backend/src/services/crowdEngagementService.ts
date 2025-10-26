import { PrismaClient } from '@prisma/client';
import { CrowdEngagementResult } from '../types';

const prisma = new PrismaClient();

const CROWD_WIN_THRESHOLD = 0.7; // 70% support
const MIN_VOTES_FOR_AUTO_WIN = 20;

export class CrowdEngagementService {
  async calculateEngagement(debateId: string): Promise<CrowdEngagementResult> {
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      include: {
        comments: {
          include: {
            votes: true,
          },
        },
        votes: true,
      },
    });

    if (!debate || !debate.challengerId) {
      return {
        creatorSupport: 0,
        challengerSupport: 0,
        shouldDecide: false,
        winner: null,
      };
    }

    // Calculate support votes (direct debate votes)
    const creatorVotes = debate.votes.filter((v: any) => v.value > 0 && v.userId !== debate.challengerId).length;
    const challengerVotes = debate.votes.filter((v: any) => v.value > 0 && v.userId !== debate.creatorId).length;

    // Calculate comment engagement
    const creatorComments = debate.comments.filter((c: any) => c.authorId === debate.creatorId);
    const challengerComments = debate.comments.filter((c: any) => c.authorId === debate.challengerId);

    const creatorCommentScore = creatorComments.reduce((sum: any, comment: any) => {
      return sum + comment.votes.filter((v: any) => v.value > 0).length;
    }, 0);

    const challengerCommentScore = challengerComments.reduce((sum: any, comment: any) => {
      return sum + comment.votes.filter((v: any) => v.value > 0).length;
    }, 0);

    const totalCreatorScore = creatorVotes * 2 + creatorCommentScore;
    const totalChallengerScore = challengerVotes * 2 + challengerCommentScore;
    const totalScore = totalCreatorScore + totalChallengerScore;

    if (totalScore === 0) {
      return {
        creatorSupport: 0,
        challengerSupport: 0,
        shouldDecide: false,
        winner: null,
      };
    }

    const creatorSupport = totalCreatorScore / totalScore;
    const challengerSupport = totalChallengerScore / totalScore;

    let shouldDecide = false;
    let winner = null;

    // Check for overwhelming support
    const totalVotes = creatorVotes + challengerVotes;
    if (totalVotes >= MIN_VOTES_FOR_AUTO_WIN) {
      if (creatorSupport >= CROWD_WIN_THRESHOLD) {
        shouldDecide = true;
        winner = debate.creatorId;
      } else if (challengerSupport >= CROWD_WIN_THRESHOLD) {
        shouldDecide = true;
        winner = debate.challengerId;
      }
    }

    return {
      creatorSupport,
      challengerSupport,
      shouldDecide,
      winner,
    };
  }
}
