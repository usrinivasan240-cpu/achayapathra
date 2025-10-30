// This file is used to implement the AI food safety check.

'use server';

/**
 * @fileOverview Implements an AI-powered food safety check for uploaded food images.
 *
 * - aiSafeFoodCheck - Checks if a food image is safe for donation using AI.
 * - AISafeFoodCheckInput - The input type for the aiSafeFoodCheck function.
 * - AISafeFoodCheckOutput - The return type for the aiSafeFoodCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISafeFoodCheckInputSchema = z.object({
  foodDataUri: z
    .string()
    .describe(
      'A photo of the food to be donated, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
  foodName: z.string().describe('The name of the food being donated.'),
  foodType: z.string().describe('The type of food (e.g., cooked, raw, canned).'),
  cookedExpiryTime: z.string().describe('The cooked/expiry time of the food.'),
  quantity: z.string().describe('The quantity of food being donated.'),
  description: z.string().optional().describe('Optional description of the food.'),
});

export type AISafeFoodCheckInput = z.infer<typeof AISafeFoodCheckInputSchema>;

const AISafeFoodCheckOutputSchema = z.object({
  safe: z.boolean().describe('Whether the food is safe for donation or not.'),
  reason: z.string().describe('The reason for the safety determination.'),
  score: z.number().describe('A score indicating the confidence level of the safety determination.'),
});

export type AISafeFoodCheckOutput = z.infer<typeof AISafeFoodCheckOutputSchema>;

export async function aiSafeFoodCheck(input: AISafeFoodCheckInput): Promise<AISafeFoodCheckOutput> {
  return aiSafeFoodCheckFlow(input);
}

const aiSafeFoodCheckPrompt = ai.definePrompt({
  name: 'aiSafeFoodCheckPrompt',
  input: {schema: AISafeFoodCheckInputSchema},
  output: {schema: AISafeFoodCheckOutputSchema},
  prompt: `You are an AI assistant specialized in determining the safety of food for donation.

You will receive information about the food, including its name, type, cooked/expiry time, quantity, description, and an image.

Based on this information, you will determine if the food is safe for donation. Consider factors such as the food's appearance in the image, the provided details, and general food safety guidelines.

Respond with a JSON object indicating whether the food is safe, the reason for your determination, and a safety score (0-1, where 1 is completely safe).

Food Name: {{{foodName}}}
Food Type: {{{foodType}}}
Cooked/Expiry Time: {{{cookedExpiryTime}}}
Quantity: {{{quantity}}}
Description: {{{description}}}
Image: {{media url=foodDataUri}}

Output: {
  "safe": true/false,
  "reason": "Explanation of why the food is safe or unsafe",
  "score": 0.0-1.0
}`,
});

const aiSafeFoodCheckFlow = ai.defineFlow(
  {
    name: 'aiSafeFoodCheckFlow',
    inputSchema: AISafeFoodCheckInputSchema,
    outputSchema: AISafeFoodCheckOutputSchema,
  },
  async input => {
    const {output} = await aiSafeFoodCheckPrompt(input);
    return output!;
  }
);
