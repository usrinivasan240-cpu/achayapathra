/**
 * @fileOverview Initializes and configures the Genkit AI instance.
 */
import {genkit, type Genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Initialize with v1beta as verified by user curl test
export const ai: Genkit = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
      apiVersion: 'v1beta',
    }),
  ],
});