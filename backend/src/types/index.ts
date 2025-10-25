import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export interface CreateDebateDTO {
  topic: string;
  description: string;
  category: string;
  initialAnte: number;
  creatorPosition: string;
}

export interface AcceptDebateDTO {
  challengerPosition: string;
  challengerAnte: number;
}

export interface CreateCommentDTO {
  content: string;
  type: 'ARGUMENT' | 'REBUTTAL' | 'EVIDENCE' | 'SPECTATOR';
  sources?: string[];
  parentId?: string;
}

export interface PlaceBetDTO {
  amount: number;
  predictedWinner: string;
}

export interface VoteDTO {
  type: 'UPVOTE' | 'DOWNVOTE' | 'SUPPORT_CREATOR' | 'SUPPORT_CHALLENGER';
}

export interface AIFactCheckResult {
  overallScore: number;
  creatorScore: number;
  challengerScore: number;
  analysis: {
    creatorArguments: ArgumentAnalysis[];
    challengerArguments: ArgumentAnalysis[];
  };
  sources: string[];
  determination: 'CREATOR' | 'CHALLENGER' | 'TIE';
}

export interface ArgumentAnalysis {
  claim: string;
  factualAccuracy: number;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  verdict: 'VERIFIED' | 'DISPUTED' | 'UNVERIFIABLE';
}

export interface CrowdEngagementMetrics {
  creatorSupport: number;
  challengerSupport: number;
  totalVotes: number;
  engagementScore: number;
  winner?: 'CREATOR' | 'CHALLENGER';
}
