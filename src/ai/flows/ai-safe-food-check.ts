
'use server';
/**
 * @fileOverview An AI flow to determine if a food image is safe for consumption.
 *
 * This file defines a Genkit flow that uses a generative AI model to analyze
 * an image of food and determine if it appears safe to eat. It is designed to
 * act as a preliminary safety check for food donations.
 *
 * - aiSafeFoodCheck - The main server action that runs the safety check.
 * - AiSafeFoodCheckInput - The Zod schema for the input (image data URI).
 * - AiSafe-food-check-output - The Zod schema for the output (safety status, reason).
 */

import {z} from 'genkit';
import {ai} from '../genkit';

// Define the input schema for the flow.
// It expects a single string which is a data URI of the food image.
export const AiSafeFoodCheckInputSchema = z.string();
export type AiSafeFoodCheckInput = z.infer<typeof AiSafeFoodCheckInputSchema>;

// Define the output schema using Zod.
// It will return whether the food is safe and a reason for the decision.
export const AiSafeFoodCheckOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the food is safe to eat or not.'),
  reason: z
    .string()
    .describe(
      'A brief explanation of why the food is considered safe or not.'
    ),
});
export type AiSafeFoodCheckOutput = z.infer<typeof AiSafeFoodCheckOutputSchema>;

// Define the main function that will be called from the client.
// This is a standard async function that takes the input and returns the output.
export async function aiSafeFoodCheck(
  photoDataUri: AiSafeFoodCheckInput
): Promise<AiSafeFoodCheckOutput> {
  // Execute the Genkit flow with the provided input.
  const flowResponse = await aiSafeFoodCheckFlow(photoDataUri);
  return flowResponse;
}

// Define the input schema for the prompt itself.
// This is separate from the flow's input to structure data for the model.
const promptInputSchema = z.object({
  photoDataUri: AiSafeFoodCheckInputSchema,
});

// Define the prompt that will be sent to the AI model.
const aiSafeFoodCheckPrompt = ai.definePrompt({
  name: 'aiSafeFoodCheckPrompt',
  // We are using the Gemini 1.5 Flash model, which is fast and cost-effective.
  model: 'gemini-1.5-flash',
  // The input schema for what gets passed into the handlebars template.
  input: {
    schema: promptInputSchema,
  },
  // The output should conform to the schema we defined earlier.
  output: {
    schema: AiSafeFoodCheckOutputSchema,
  },
  // The prompt text itself. It instructs the AI to act as a food safety expert.
  // The `{{media}}` helper is the correct way to include image data.
  prompt: `You are a food safety expert. Based on the provided image, determine if the food looks safe to eat. Consider factors like mold, discoloration, or any signs of spoilage. Provide a clear "yes" or "no" for safety and a brief, one-sentence reason for your decision. Image: {{media url=photoDataUri}}`,
});

// Define the Genkit flow. A flow orchestrates one or more AI (or other) steps.
const aiSafeFoodCheckFlow = ai.defineFlow(
  {
    name: 'aiSafeFoodCheckFlow',
    inputSchema: AiSafeFoodCheckInputSchema,
    outputSchema: AiSafeFoodCheckOutputSchema,
  },
  async photoDataUri => {
    // Call the prompt, passing the input in the structure the prompt expects.
    const {output} = await aiSafeFoodCheckPrompt({photoDataUri});

    // If the model doesn't return a valid output, throw an error.
    if (!output) {
      throw new Error('The model did not return a valid safety assessment.');
    }
    // Return the structured output from the model.
    return output;
  }
);
