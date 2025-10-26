export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export interface AIFactCheckResult {
  creatorScore: number;
  challengerScore: number;
  determination: 'CREATOR' | 'CHALLENGER' | 'TIE';
  reasoning: string;
  claims: {
    creator: string[];
    challenger: string[];
  };
  verifications: {
    claim: string;
    verified: boolean;
    sources: string[];
  }[];
}

export interface CrowdEngagementResult {
  creatorSupport: number;
  challengerSupport: number;
  shouldDecide: boolean;
  winner: string | null;
}
