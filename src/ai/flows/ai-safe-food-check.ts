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
  prompt: `You are an expert food safety inspector for a food donation platform. Your primary goal is to prevent unsafe food from being listed. You must be cautious and strict.

You will receive information about a food item and an image. Analyze them critically to determine if the food is safe for donation.

**Safety Criteria:**
1.  **Visual Inspection (Image):** Look for any signs of spoilage, such as mold, discoloration, unusual texture, or decay. For packaged goods, check if the packaging is intact and not bloated.
2.  **Food Type & Time:** Consider the food type (e.g., cooked meals, baked goods, produce). Cooked meals and other perishables have a short shelf life.
3.  **Information Consistency:** Check if the description and image are consistent.
4.  **Err on the side of caution:** If there is any doubt, or if the image is blurry, poorly lit, or otherwise unclear, you must mark the food as unsafe and recommend a manual review.

**Input Data:**
- Food Name: {{{foodName}}}
- Food Type: {{{foodType}}}
- Cooked/Expiry Time: {{{cookedExpiryTime}}}
- Quantity: {{{quantity}}}
- Description: {{{description}}}
- Image: {{media url=foodDataUri}}

**Your Task:**
Based on the criteria, determine if the food is safe. Respond with a JSON object that includes:
- \`safe\`: \`true\` if you are highly confident it is safe, otherwise \`false\`.
- \`reason\`: A clear, concise explanation for your decision. If unsafe, specify the exact concern (e.g., "Visible mold detected," "Packaging appears damaged," "Image is too blurry to assess safety").
- \`score\`: A confidence score from 0.0 (certainly unsafe) to 1.0 (certainly safe). Give a score below 0.7 if you have any reservations.
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
