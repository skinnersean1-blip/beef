import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AIFactCheckResult, ArgumentAnalysis } from '../types';
import { AppError } from '../middleware/errorHandler';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  /**
   * Main AI fact-checking function
   * Analyzes debate arguments and verifies claims against web sources
   */
  async factCheckDebate(
    topic: string,
    creatorArguments: string[],
    challengerArguments: string[],
    creatorPosition: string,
    challengerPosition: string
  ): Promise<AIFactCheckResult> {
    try {
      // Extract claims from arguments
      const creatorClaims = await this.extractClaims(creatorArguments);
      const challengerClaims = await this.extractClaims(challengerArguments);

      // Fact-check each claim
      const creatorAnalysis = await Promise.all(
        creatorClaims.map((claim) => this.verifyClaimWithWebSearch(claim, topic))
      );

      const challengerAnalysis = await Promise.all(
        challengerClaims.map((claim) => this.verifyClaimWithWebSearch(claim, topic))
      );

      // Calculate scores
      const creatorScore = this.calculateFactualScore(creatorAnalysis);
      const challengerScore = this.calculateFactualScore(challengerAnalysis);

      // Determine winner
      let determination: 'CREATOR' | 'CHALLENGER' | 'TIE';
      const scoreDiff = Math.abs(creatorScore - challengerScore);

      if (scoreDiff < 0.1) {
        determination = 'TIE';
      } else if (creatorScore > challengerScore) {
        determination = 'CREATOR';
      } else {
        determination = 'CHALLENGER';
      }

      const overallScore = (creatorScore + challengerScore) / 2;

      // Collect all sources
      const allSources = [
        ...creatorAnalysis.flatMap((a) => a.supportingEvidence),
        ...challengerAnalysis.flatMap((a) => a.supportingEvidence),
      ];

      return {
        overallScore,
        creatorScore,
        challengerScore,
        analysis: {
          creatorArguments: creatorAnalysis,
          challengerArguments: challengerAnalysis,
        },
        sources: [...new Set(allSources)], // Unique sources
        determination,
      };
    } catch (error) {
      console.error('AI fact-checking error:', error);
      throw new AppError('Failed to perform AI fact-checking', 500);
    }
  }

  /**
   * Extract factual claims from debate arguments using GPT
   */
  private async extractClaims(arguments: string[]): Promise<string[]> {
    const combinedText = arguments.join('\n\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'Extract specific factual claims from the following debate arguments. Return only verifiable factual statements, one per line. Ignore opinions and subjective statements.',
        },
        {
          role: 'user',
          content: combinedText,
        },
      ],
      temperature: 0.3,
    });

    const claims = response.choices[0].message.content
      ?.split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => line.replace(/^[-*•]\s*/, '').trim());

    return claims || [];
  }

  /**
   * Verify a claim by searching the web and analyzing results
   */
  private async verifyClaimWithWebSearch(
    claim: string,
    context: string
  ): Promise<ArgumentAnalysis> {
    try {
      // Generate search query
      const searchQuery = await this.generateSearchQuery(claim, context);

      // Perform web search (using a mock implementation - in production, use Google Custom Search API or similar)
      const searchResults = await this.performWebSearch(searchQuery);

      // Analyze search results with GPT
      const analysis = await this.analyzeSearchResults(claim, searchResults);

      return {
        claim,
        factualAccuracy: analysis.accuracy,
        supportingEvidence: analysis.supporting,
        contradictingEvidence: analysis.contradicting,
        verdict: analysis.verdict,
      };
    } catch (error) {
      console.error('Claim verification error:', error);
      return {
        claim,
        factualAccuracy: 0.5,
        supportingEvidence: [],
        contradictingEvidence: [],
        verdict: 'UNVERIFIABLE',
      };
    }
  }

  /**
   * Generate an effective search query from a claim
   */
  private async generateSearchQuery(claim: string, context: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Generate a concise search query to verify the following claim. Return only the search query, no explanation.',
        },
        {
          role: 'user',
          content: `Context: ${context}\nClaim: ${claim}`,
        },
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content?.trim() || claim;
  }

  /**
   * Perform web search (mock implementation)
   * In production, integrate with Google Custom Search API, Bing API, or SerpAPI
   */
  private async performWebSearch(query: string): Promise<string[]> {
    // This is a simplified mock implementation
    // In production, use a real search API

    try {
      // For demonstration, we'll scrape a few educational/news sites
      const sources = [
        `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(/\s+/g, '_'))}`,
      ];

      const results: string[] = [];

      for (const url of sources) {
        try {
          const response = await axios.get(url, {
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; BeefFactChecker/1.0)',
            },
          });

          const $ = cheerio.load(response.data);
          const text = $('p').first().text().substring(0, 500);

          if (text) {
            results.push(`Source: ${url}\n${text}`);
          }
        } catch (err) {
          // Skip failed requests
          continue;
        }
      }

      return results.length > 0
        ? results
        : ['No verifiable sources found for this claim.'];
    } catch (error) {
      return ['Unable to perform web search at this time.'];
    }
  }

  /**
   * Analyze search results to verify the claim
   */
  private async analyzeSearchResults(
    claim: string,
    searchResults: string[]
  ): Promise<{
    accuracy: number;
    supporting: string[];
    contradicting: string[];
    verdict: 'VERIFIED' | 'DISPUTED' | 'UNVERIFIABLE';
  }> {
    const combinedResults = searchResults.join('\n\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Analyze whether the following claim is supported by the search results.
          Return a JSON object with:
          - accuracy: number between 0 and 1
          - supporting: array of supporting evidence quotes
          - contradicting: array of contradicting evidence quotes
          - verdict: "VERIFIED", "DISPUTED", or "UNVERIFIABLE"`,
        },
        {
          role: 'user',
          content: `Claim: ${claim}\n\nSearch Results:\n${combinedResults}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      accuracy: result.accuracy || 0.5,
      supporting: result.supporting || [],
      contradicting: result.contradicting || [],
      verdict: result.verdict || 'UNVERIFIABLE',
    };
  }

  /**
   * Calculate overall factual score from argument analyses
   */
  private calculateFactualScore(analyses: ArgumentAnalysis[]): number {
    if (analyses.length === 0) return 0.5;

    const totalScore = analyses.reduce((sum, analysis) => {
      let score = analysis.factualAccuracy;

      // Bonus for verified claims
      if (analysis.verdict === 'VERIFIED') score *= 1.2;
      // Penalty for disputed claims
      if (analysis.verdict === 'DISPUTED') score *= 0.7;

      return sum + score;
    }, 0);

    return Math.min(totalScore / analyses.length, 1.0);
  }

  /**
   * Generate AI summary of debate
   */
  async generateDebateSummary(
    topic: string,
    creatorPosition: string,
    challengerPosition: string,
    comments: Array<{ author: string; content: string }>
  ): Promise<string> {
    const debateText = comments
      .map((c) => `${c.author}: ${c.content}`)
      .join('\n\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'Summarize the following debate in 2-3 paragraphs, highlighting key arguments from both sides.',
        },
        {
          role: 'user',
          content: `Topic: ${topic}\n\nCreator Position: ${creatorPosition}\nChallenger Position: ${challengerPosition}\n\nDebate:\n${debateText}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    return response.choices[0].message.content || 'Unable to generate summary.';
  }
}
