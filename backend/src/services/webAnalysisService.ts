import OpenAI from 'openai';
import axios from 'axios';
import { WebAnalysisResult } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export class WebAnalysisService {
  async analyzeDebate(
    topic: string,
    creatorPosts: string[],
    challengerPosts: string[],
    creatorPosition: string,
    challengerPosition: string
  ): Promise<WebAnalysisResult> {
    try {
      // Combine all arguments
      const creatorArguments = [creatorPosition, ...creatorPosts].join('\n\n');
      const challengerArguments = [challengerPosition, ...challengerPosts].join('\n\n');

      // Use GPT-4 to analyze factual accuracy
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an impartial fact-checker analyzing a debate. Evaluate both sides based on factual accuracy, evidence quality, and logical reasoning. Use your knowledge and indicate if claims can be verified. Respond with a JSON object containing creatorScore (0-100), challengerScore (0-100), winner (CREATOR/CHALLENGER/DRAW), reasoning (brief explanation), and sources (array of reference points).',
          },
          {
            role: 'user',
            content: `Topic: ${topic}\n\nCreator Position:\n${creatorArguments}\n\nChallenger Position:\n${challengerArguments}\n\nAnalyze this debate and determine the winner based on facts.`,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');

      return {
        creatorScore: result.creatorScore || 50,
        challengerScore: result.challengerScore || 50,
        winner: result.winner || 'DRAW',
        reasoning: result.reasoning || 'Unable to determine clear winner',
        sources: result.sources || ['GPT-4 Analysis'],
      };
    } catch (error) {
      console.error('Web analysis error:', error);
      // Fallback to draw if analysis fails
      return {
        creatorScore: 50,
        challengerScore: 50,
        winner: 'DRAW',
        reasoning: 'Analysis failed, declaring draw',
        sources: [],
      };
    }
  }
}
