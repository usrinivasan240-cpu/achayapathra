// This file is used to implement the AI food safety check.

'use server';

/**
 * @fileOverview Implements an AI-powered check to determine if an image contains food.
 *
 * - aiSafeFoodCheck - Checks if an image contains food using AI.
 * - AISafeFoodCheckInput - The input type for the aiSafeFoodCheck function.
 * - AISafeFoodCheckOutput - The return type for the aiSafeFoodCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISafeFoodCheckInputSchema = z.object({
  foodDataUri: z
    .string()
    .describe(
      'A photo of the item to be checked, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});

export type AISafeFoodCheckInput = z.infer<typeof AISafeFoodCheckInputSchema>;

const AISafeFoodCheckOutputSchema = z.object({
  isFood: z.boolean().describe('Whether the image contains food or not.'),
  reason: z.string().describe('The reason for the determination.'),
});

export type AISafeFoodCheckOutput = z.infer<typeof AISafeFoodCheckOutputSchema>;

export async function aiSafeFoodCheck(input: AISafeFoodCheckInput): Promise<AISafeFoodCheckOutput> {
  return aiSafeFoodCheckFlow(input);
}

const aiSafeFoodCheckPrompt = ai.definePrompt({
  name: 'aiSafeFoodCheckPrompt',
  input: {schema: AISafeFoodCheckInputSchema},
  output: {schema: AISafeFoodCheckOutputSchema},
  prompt: `You are an image analysis AI. Your only task is to determine if the provided image contains food.

**Analysis Criteria:**
1.  **Visual Inspection (Image):** Look for any edible items.
2.  **Be definitive:** If you see something that is clearly food, respond that it is food. If it is not food, or if the image is unclear, respond that it is not food.

**Input Data:**
- Image: {{media url=foodDataUri}}

**Your Task:**
Based on the criteria, determine if the image contains food. Respond with a JSON object that includes:
- \`isFood\`: \`true\` if you are confident the image contains food, otherwise \`false\`.
- \`reason\`: A clear, concise explanation for your decision (e.g., "The image contains a cooked meal," or "The image appears to be of a non-food object.").
`,
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
