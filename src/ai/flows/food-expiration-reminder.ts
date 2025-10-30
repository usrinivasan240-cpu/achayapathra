'use server';

/**
 * @fileOverview A food expiration date reminder AI agent.
 *
 * - foodExpirationReminder - A function that handles the food expiration date estimation process.
 * - FoodExpirationReminderInput - The input type for the foodExpirationReminder function.
 * - FoodExpirationReminderOutput - The return type for the foodExpirationReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FoodExpirationReminderInputSchema = z.object({
  foodName: z.string().describe('The name of the food being donated.'),
  foodType: z.string().describe('The type of food (e.g., fruit, vegetable, meat, dairy).'),
  cookedTime: z.string().describe('The time the food was cooked (if applicable).'),
  quantity: z.string().describe('The quantity of the food being donated.'),
  description: z.string().optional().describe('Optional description of the food.'),
  foodImageDataUri: z
    .string()
    .describe(
      "A photo of the food, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type FoodExpirationReminderInput = z.infer<typeof FoodExpirationReminderInputSchema>;

const FoodExpirationReminderOutputSchema = z.object({
  estimatedExpirationDate: z.string().describe('The estimated expiration date of the food.'),
  confidenceLevel: z
    .string()
    .describe('The confidence level of the estimated expiration date (e.g., high, medium, low).'),
  additionalNotes: z.string().optional().describe('Any additional notes or recommendations.'),
});
export type FoodExpirationReminderOutput = z.infer<typeof FoodExpirationReminderOutputSchema>;

export async function foodExpirationReminder(input: FoodExpirationReminderInput): Promise<
  FoodExpirationReminderOutput
> {
  return foodExpirationReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'foodExpirationReminderPrompt',
  input: {schema: FoodExpirationReminderInputSchema},
  output: {schema: FoodExpirationReminderOutputSchema},
  prompt: `You are an expert in food safety and expiration dates. Based on the following information about the donated food, estimate its expiration date. Provide a confidence level for your estimation and any additional notes or recommendations.

Food Name: {{{foodName}}}
Food Type: {{{foodType}}}
Cooked Time: {{{cookedTime}}}
Quantity: {{{quantity}}}
Description: {{{description}}}
Photo: {{media url=foodImageDataUri}}

Respond with a valid JSON object.
`,
});

const foodExpirationReminderFlow = ai.defineFlow(
  {
    name: 'foodExpirationReminderFlow',
    inputSchema: FoodExpirationReminderInputSchema,
    outputSchema: FoodExpirationReminderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
