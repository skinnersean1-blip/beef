import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { CommentService } from '../services/commentService';
import { PrismaClient } from '@prisma/client';

const commentService = new CommentService();
const prisma = new PrismaClient();

export class CommentController {
  async createComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { debateId } = req.params;
      const { content, type, sources, parentId } = req.body;

      if (!content || !type) {
        return res.status(400).json({ error: 'Content and type are required' });
      }

      const comment = await commentService.createComment(userId, debateId, {
        content,
        type,
        sources,
        parentId,
      });

      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { debateId } = req.params;

      const comments = await commentService.getComments(debateId);

      res.json(comments);
    } catch (error) {
      next(error);
    }
  }

  async voteOnComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { commentId } = req.params;
      const { type } = req.body;

      if (!type) {
        return res.status(400).json({ error: 'Vote type is required' });
      }

      const result = await commentService.voteOnComment(userId, commentId, type);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async voteOnDebate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { debateId } = req.params;
      const { type } = req.body;

      if (!type) {
        return res.status(400).json({ error: 'Vote type is required' });
      }

      // Check if vote exists
      const existingVote = await prisma.vote.findFirst({
        where: {
          userId,
          debateId,
          type: type as any,
        },
      });

      if (existingVote) {
        // Remove vote
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });

        res.json({ action: 'removed' });
      } else {
        // Add vote
        await prisma.vote.create({
          data: {
            userId,
            debateId,
            type: type as any,
          },
        });

        res.json({ action: 'added' });
      }
    } catch (error) {
      next(error);
    }
  }
}
