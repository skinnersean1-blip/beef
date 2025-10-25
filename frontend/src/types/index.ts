export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  walletBalance: number;
  createdAt: string;
}

export interface Debate {
  id: string;
  topic: string;
  description: string;
  category: string;
  initialAnte: number;
  totalPot: number;
  status: 'OPEN' | 'ACTIVE' | 'EXTENDED' | 'COMPLETED' | 'CANCELLED';
  startsAt?: string;
  endsAt?: string;
  extendedTimes: number;
  creatorId: string;
  creator: User;
  creatorPosition: string;
  challengerId?: string;
  challenger?: User;
  challengerPosition?: string;
  challengerAnte?: number;
  winnerId?: string;
  winnerDetermination?: string;
  aiFactCheckScore?: any;
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
    votes: number;
    bets: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  type: 'ARGUMENT' | 'REBUTTAL' | 'EVIDENCE' | 'SPECTATOR';
  sources: string[];
  debateId: string;
  authorId: string;
  author: User;
  parentId?: string;
  replies?: Comment[];
  votes: Vote[];
  createdAt: string;
  _count?: {
    votes: number;
    replies: number;
  };
}

export interface Vote {
  id: string;
  type: 'UPVOTE' | 'DOWNVOTE' | 'SUPPORT_CREATOR' | 'SUPPORT_CHALLENGER';
  userId: string;
  debateId?: string;
  commentId?: string;
  createdAt: string;
}

export interface Bet {
  id: string;
  amount: number;
  predictedWinner: string;
  odds: number;
  potentialPayout: number;
  status: 'PENDING' | 'ACTIVE' | 'WON' | 'LOST' | 'REFUNDED';
  userId: string;
  user?: User;
  debateId: string;
  debate?: Debate;
  createdAt: string;
  settledAt?: string;
}

export interface DebateStats {
  engagement: {
    creatorSupport: number;
    challengerSupport: number;
    totalVotes: number;
    engagementScore: number;
    winner?: 'CREATOR' | 'CHALLENGER';
  };
  comments: {
    creator: number;
    challenger: number;
    spectators: number;
    total: number;
  };
  betting: {
    totalAmount: number;
    creatorBets: {
      count: number;
      amount: number;
    };
    challengerBets: {
      count: number;
      amount: number;
    };
  };
  pot: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
