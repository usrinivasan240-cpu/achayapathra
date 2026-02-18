/**
 * @fileOverview Initializes and configures the Genkit AI instance.
 *
 * This file sets up the Genkit AI plugin with Google Generative AI,
 * making the 'gemini-2.5-flash' model available for use in AI flows.
 * It exports a single `ai` object that should be used throughout the
 * application to define and run AI-powered tasks.
 */
import {genkit, type Genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Initialize the Genkit instance with the Google AI plugin.
// The API key is sourced from the GEMINI_API_KEY environment variable.
export const ai: Genkit = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});
