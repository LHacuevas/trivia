'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating difficult trivia questions.
 *
 * The flow takes the number of questions as input and returns an array of trivia questions.
 * - generateTriviaQuestions - A function that generates trivia questions.
 * - GenerateTriviaQuestionsInput - The input type for the generateTriviaQuestions function.
 * - GenerateTriviaQuestionsOutput - The return type for the generateTriviaQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTriviaQuestionsInputSchema = z.object({
  numberOfQuestions: z
    .number()
    .min(1)
    .max(50)
    .describe('The number of trivia questions to generate.'),
});
export type GenerateTriviaQuestionsInput = z.infer<
  typeof GenerateTriviaQuestionsInputSchema
>;

const TriviaQuestionSchema = z.object({
  question: z.string().describe('The trivia question.'),
  answer: z.string().describe('The correct answer to the question.'),
  category: z.string().describe('The category of the trivia question.'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty level of the question.'),
});

const GenerateTriviaQuestionsOutputSchema = z.array(TriviaQuestionSchema);
export type GenerateTriviaQuestionsOutput = z.infer<
  typeof GenerateTriviaQuestionsOutputSchema
>;

export async function generateTriviaQuestions(
  input: GenerateTriviaQuestionsInput
): Promise<GenerateTriviaQuestionsOutput> {
  return generateTriviaQuestionsFlow(input);
}

const generateTriviaQuestionsPrompt = ai.definePrompt({
  name: 'generateTriviaQuestionsPrompt',
  input: {schema: GenerateTriviaQuestionsInputSchema},
  output: {schema: GenerateTriviaQuestionsOutputSchema},
  prompt: `You are an expert trivia question generator. Your task is to generate {{numberOfQuestions}} difficult trivia questions on various topics.

Each question should be unique, challenging, and engaging. Avoid generating questions that are too similar to each other.

Each question should have a clear answer and belong to a specific category and have a difficulty level of hard.

Ensure that the output is a valid JSON array of trivia questions.

Here's the format for each question:
{
  "question": "The trivia question.",
  "answer": "The correct answer to the question.",
  "category": "The category of the trivia question.",
  "difficulty": "hard"
}

Output:`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateTriviaQuestionsFlow = ai.defineFlow(
  {
    name: 'generateTriviaQuestionsFlow',
    inputSchema: GenerateTriviaQuestionsInputSchema,
    outputSchema: GenerateTriviaQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateTriviaQuestionsPrompt(input);
    return output!;
  }
);
