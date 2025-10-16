'use server';

/**
 * @fileOverview Analyzes past game data to identify challenging question categories for game admins.
 *
 * - analyzeGameHistory - A function that analyzes the game history to identify challenging categories.
 * - AnalyzeGameHistoryInput - The input type for the analyzeGameHistory function.
 * - AnalyzeGameHistoryOutput - The return type for the analyzeGameHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeGameHistoryInputSchema = z.object({
  gameHistory: z
    .string()
    .describe(
      'A string containing the game history data, including question categories and player answers.'
    ),
});
export type AnalyzeGameHistoryInput = z.infer<typeof AnalyzeGameHistoryInputSchema>;

const AnalyzeGameHistoryOutputSchema = z.object({
  challengingCategories: z
    .string()
    .describe(
      'A comma-separated list of question categories that players consistently struggle with.'
    ),
});
export type AnalyzeGameHistoryOutput = z.infer<typeof AnalyzeGameHistoryOutputSchema>;

export async function analyzeGameHistory(
  input: AnalyzeGameHistoryInput
): Promise<AnalyzeGameHistoryOutput> {
  return analyzeGameHistoryFlow(input);
}

const analyzeGameHistoryPrompt = ai.definePrompt({
  name: 'analyzeGameHistoryPrompt',
  input: {schema: AnalyzeGameHistoryInputSchema},
  output: {schema: AnalyzeGameHistoryOutputSchema},
  prompt: `You are an AI assistant specializing in analyzing trivia game history.

  Your task is to analyze the game history data provided and identify question categories that are consistently challenging for players.

  Consider the following:
  - Frequency of incorrect answers: Which categories have the highest number of incorrect answers across multiple games?
  - Player performance: Which categories do players generally score lower in?
  - Difficulty perception: Are there any categories that players frequently complain about being too difficult?

  Use the following game history data to identify the challenging categories:
  Game History: {{{gameHistory}}}

  Challenging Categories (comma-separated):`,
});

const analyzeGameHistoryFlow = ai.defineFlow(
  {
    name: 'analyzeGameHistoryFlow',
    inputSchema: AnalyzeGameHistoryInputSchema,
    outputSchema: AnalyzeGameHistoryOutputSchema,
  },
  async input => {
    const {output} = await analyzeGameHistoryPrompt(input);
    return output!;
  }
);
