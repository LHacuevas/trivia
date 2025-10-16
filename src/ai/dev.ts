import { config } from 'dotenv';
config();

import '@/ai/flows/generate-trivia-questions.ts';
import '@/ai/flows/summarize-game-history.ts';
import '@/ai/flows/analyze-game-history.ts';