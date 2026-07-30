'use server';
/**
 * @fileOverview An AI flow to analyze a food image for identification and safety.
 *
 * This file defines a Genkit flow that uses a generative AI model to analyze
 * an image of food. It identifies the food, assesses its safety, and provides
 * a brief description.
 *
 * - aiSafeFoodCheck - The main server action that runs the analysis.
 * - AiSafeFoodCheckInput - The Zod schema for the input (image data URI).
 * - AiSafeFoodCheckOutput - The Zod schema for the structured output.
 */

import {z} from 'genkit';
import {ai} from '../genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Define the input schema for the flow.
const AiSafeFoodCheckInputSchema = z.string();
export type AiSafeFoodCheckInput = z.infer<typeof AiSafeFoodCheckInputSchema>;

// Define the output schema.
const AiSafeFoodCheckOutputSchema = z.object({
  foodName: z.string(),
  isSafe: z.boolean(),
  reason: z.string(),
  description: z.string(),
});
export type AiSafeFoodCheckOutput = z.infer<typeof AiSafeFoodCheckOutputSchema>;

export async function aiSafeFoodCheck(
  photoDataUri: AiSafeFoodCheckInput
): Promise<AiSafeFoodCheckOutput> {
  return aiSafeFoodCheckFlow(photoDataUri);
}

const promptInputSchema = z.object({
  photoDataUri: AiSafeFoodCheckInputSchema,
});

const aiSafeFoodCheckPrompt = ai.definePrompt({
  name: 'aiSafeFoodCheckPrompt',
  model: googleAI.model('gemini-2.0-flash'), // Using the verified model
  input: {
    schema: promptInputSchema,
  },
  prompt: `Analyze the image of the food item provided. Determine if it is safe to eat.
  
Identify the food, check for signs of spoilage or freshness, and provide an interesting fact.

Your response MUST be a single, valid JSON object with the following fields:
{
  "foodName": "string",
  "isSafe": boolean,
  "reason": "string",
  "description": "string"
}

Image:
{{media url=photoDataUri}}`,
});

const aiSafeFoodCheckFlow = ai.defineFlow(
  {
    name: 'aiSafeFoodCheckFlow',
    inputSchema: AiSafeFoodCheckInputSchema,
    outputSchema: AiSafeFoodCheckOutputSchema,
  },
  async photoDataUri => {
    const response = await aiSafeFoodCheckPrompt({photoDataUri});
    const rawText = response.text;

    if (!rawText) {
      throw new Error('The model did not return a response.');
    }

    try {
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('Invalid response format.');
      }
      
      const jsonString = rawText.substring(firstBrace, lastBrace + 1);
      const parsedOutput = JSON.parse(jsonString);
      return AiSafeFoodCheckOutputSchema.parse(parsedOutput);

    } catch (e: any) {
      console.error("Failed to parse model output:", rawText);
      throw new Error(`Analysis failed. Please try again.`);
    }
  }
);