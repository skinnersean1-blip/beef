import { PrismaClient, CommentType } from '@prisma/client';
import { CreateCommentDTO } from '../types';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class CommentService {
  async createComment(
    userId: string,
    debateId: string,
    data: CreateCommentDTO
  ) {
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
    });

    if (!debate) {
      throw new AppError('Debate not found', 404);
    }

    // Validate comment type based on user role
    const isParticipant =
      debate.creatorId === userId || debate.challengerId === userId;

    if (!isParticipant && data.type !== 'SPECTATOR') {
      throw new AppError('Only participants can post arguments', 403);
    }

    if (data.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: data.parentId },
      });

      if (!parent || parent.debateId !== debateId) {
        throw new AppError('Invalid parent comment', 400);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        type: data.type,
        sources: data.sources || [],
        authorId: userId,
        debateId,
        parentId: data.parentId,
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
      },
    });

    // Notify debate participants (except the commenter)
    const notifyUserIds = [debate.creatorId, debate.challengerId].filter(
      (id) => id && id !== userId
    );

    for (const notifyUserId of notifyUserIds) {
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          type: 'new_comment',
          title: 'New Comment',
          message: `New comment on debate: ${debate.topic}`,
          link: `/debates/${debateId}`,
        },
      });
    }

    return comment;
  }

  async getComments(debateId: string) {
    const comments = await prisma.comment.findMany({
      where: { debateId },
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
            replies: true,
            votes: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments;
  }

  async voteOnComment(userId: string, commentId: string, voteType: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_commentId_type: {
          userId,
          commentId,
          type: voteType as any,
        },
      },
    });

    if (existingVote) {
      // Remove vote (toggle)
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });

      return { action: 'removed' };
    } else {
      // Add vote
      await prisma.vote.create({
        data: {
          userId,
          commentId,
          type: voteType as any,
        },
      });

      return { action: 'added' };
    }
  }
}
