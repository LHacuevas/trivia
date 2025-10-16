'use server';

/**
 * @fileOverview Summarizes the game history for a player, extracting key statistics and interesting moments.
 *
 * - summarizeGameHistory - A function that summarizes the game history for a player.
 * - SummarizeGameHistoryInput - The input type for the summarizeGameHistory function.
 * - SummarizeGameHistoryOutput - The return type for the summarizeGameHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeGameHistoryInputSchema = z.object({
  gameHistory: z
    .string()
    .describe(
      'A string containing the game history data, including player names, scores, questions asked, and answers given.'
    ),
  playerName: z.string().describe('The name of the player for whom to summarize the game history.'),
});
export type SummarizeGameHistoryInput = z.infer<typeof SummarizeGameHistoryInputSchema>;

const SummarizeGameHistoryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the game history, including key statistics, interesting moments, and personalized insights for the player.'
    ),
});
export type SummarizeGameHistoryOutput = z.infer<typeof SummarizeGameHistoryOutputSchema>;

export async function summarizeGameHistory(
  input: SummarizeGameHistoryInput
): Promise<SummarizeGameHistoryOutput> {
  return summarizeGameHistoryFlow(input);
}

const summarizeGameHistoryPrompt = ai.definePrompt({
  name: 'summarizeGameHistoryPrompt',
  input: {schema: SummarizeGameHistoryInputSchema},
  output: {schema: SummarizeGameHistoryOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing trivia game history for players.

  Your task is to analyze the game history provided and generate a personalized summary for the player, focusing on key statistics, interesting moments, and insights into their performance.

  Consider the following:
  - Player's overall performance: How well did the player perform in terms of correct answers and score?
  - Strengths and weaknesses: Which categories or types of questions did the player excel in or struggle with?
  - Memorable moments: Were there any particularly interesting or challenging questions or answers?
  - Comparison to other players: How did the player's performance compare to that of other players in the game?

  Use the following game history data to create the summary:
  Game History: {{{gameHistory}}}
  Player Name: {{{playerName}}}

  Summary:`,
});

const summarizeGameHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeGameHistoryFlow',
    inputSchema: SummarizeGameHistoryInputSchema,
    outputSchema: SummarizeGameHistoryOutputSchema,
  },
  async input => {
    const {output} = await summarizeGameHistoryPrompt(input);
    return output!;
  }
);
