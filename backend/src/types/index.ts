export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export interface WebAnalysisResult {
  creatorScore: number;
  challengerScore: number;
  winner: 'CREATOR' | 'CHALLENGER' | 'DRAW';
  reasoning: string;
  sources: string[];
}
