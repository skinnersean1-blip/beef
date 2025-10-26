import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AIFactCheckResult } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export class AIService {
  async factCheckDebate(
    topic: string,
    creatorArguments: string[],
    challengerArguments: string[],
    creatorPosition: string,
    challengerPosition: string
  ): Promise<AIFactCheckResult> {
    try {
      // Step 1: Extract claims from arguments
      const creatorClaims = await this.extractClaims(creatorArguments, creatorPosition);
      const challengerClaims = await this.extractClaims(challengerArguments, challengerPosition);

      // Step 2: Verify each claim using web search
      const creatorVerifications = await Promise.all(
        creatorClaims.map((claim) => this.verifyClaim(claim, topic))
      );

      const challengerVerifications = await Promise.all(
        challengerClaims.map((claim) => this.verifyClaim(claim, topic))
      );

      // Step 3: Calculate scores
      const creatorScore = creatorVerifications.filter((v) => v.verified).length / creatorClaims.length || 0;
      const challengerScore = challengerVerifications.filter((v) => v.verified).length / challengerClaims.length || 0;

      // Step 4: Determine winner
      let determination: 'CREATOR' | 'CHALLENGER' | 'TIE';
      if (creatorScore > challengerScore + 0.1) {
        determination = 'CREATOR';
      } else if (challengerScore > creatorScore + 0.1) {
        determination = 'CHALLENGER';
      } else {
        determination = 'TIE';
      }

      // Step 5: Generate reasoning
      const reasoning = await this.generateReasoning(
        topic,
        creatorScore,
        challengerScore,
        creatorVerifications,
        challengerVerifications
      );

      return {
        creatorScore,
        challengerScore,
        determination,
        reasoning,
        claims: {
          creator: creatorClaims,
          challenger: challengerClaims,
        },
        verifications: [...creatorVerifications, ...challengerVerifications],
      };
    } catch (error) {
      console.error('AI fact-check error:', error);
      throw new Error('AI fact-checking failed');
    }
  }

  private async extractClaims(textArray: string[], position: string): Promise<string[]> {
    const combinedText = textArray.join('\n');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Extract specific factual claims from the following debate arguments. Return only verifiable claims, one per line.',
        },
        {
          role: 'user',
          content: `Position: ${position}\n\nArguments:\n${combinedText}`,
        },
      ],
      max_tokens: 500,
    });

    const claims = completion.choices[0]?.message?.content?.split('\n').filter((c) => c.trim()) || [];
    return claims.slice(0, 5); // Limit to 5 claims
  }

  private async verifyClaim(claim: string, topic: string): Promise<{
    claim: string;
    verified: boolean;
    sources: string[];
  }> {
    try {
      // Simulate web search by using GPT to verify claim
      // In production, you'd use actual web scraping here
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a fact-checker. Verify if the following claim is true based on your knowledge. Respond with YES or NO followed by a brief explanation.',
          },
          {
            role: 'user',
            content: `Topic: ${topic}\n\nClaim: ${claim}`,
          },
        ],
        max_tokens: 200,
      });

      const response = completion.choices[0]?.message?.content || '';
      const verified = response.toUpperCase().startsWith('YES');

      return {
        claim,
        verified,
        sources: ['GPT-4 Knowledge Base'],
      };
    } catch (error) {
      return {
        claim,
        verified: false,
        sources: [],
      };
    }
  }

  private async generateReasoning(
    topic: string,
    creatorScore: number,
    challengerScore: number,
    creatorVerifications: any[],
    challengerVerifications: any[]
  ): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Provide a brief, balanced analysis of the debate based on fact-checking results.',
        },
        {
          role: 'user',
          content: `Topic: ${topic}\n\nCreator Score: ${creatorScore}\nChallenger Score: ${challengerScore}\n\nProvide reasoning for the determination.`,
        },
      ],
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || 'Unable to generate reasoning';
  }
}
