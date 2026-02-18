
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

// Define the input schema for the flow.
// It expects a single string which is a data URI of the food image.
const AiSafeFoodCheckInputSchema = z.string();
export type AiSafeFoodCheckInput = z.infer<typeof AiSafeFoodCheckInputSchema>;

// Define the expanded output schema for a more detailed analysis.
const AiSafeFoodCheckOutputSchema = z.object({
  foodName: z
    .string()
    .describe(
      'The identified name of the food in the image, for example "Samosa" or "Vegetable Biryani".'
    ),
  isSafe: z
    .boolean()
    .describe(
      'Whether the food appears safe to eat based on visual inspection.'
    ),
  reason: z
    .string()
    .describe(
      'A brief explanation for the safety assessment, noting any signs of spoilage or freshness.'
    ),
  description: z
    .string()
    .describe(
      'A short, interesting fact or description about the identified food item, as if from an encyclopedia.'
    ),
});
export type AiSafeFoodCheckOutput = z.infer<typeof AiSafeFoodCheckOutputSchema>;

// Define the main function that will be called from the client.
export async function aiSafeFoodCheck(
  photoDataUri: AiSafeFoodCheckInput
): Promise<AiSafeFoodCheckOutput> {
  // Execute the Genkit flow with the provided input.
  const flowResponse = await aiSafeFoodCheckFlow(photoDataUri);
  return flowResponse;
}

// Define the input schema for the prompt itself.
const promptInputSchema = z.object({
  photoDataUri: AiSafeFoodCheckInputSchema,
});

// Define the prompt that will be sent to the AI model.
const aiSafeFoodCheckPrompt = ai.definePrompt({
  name: 'aiSafeFoodCheckPrompt',
  model: 'gemini-1.5-flash',
  input: {
    schema: promptInputSchema,
  },
  output: {
    schema: AiSafeFoodCheckOutputSchema,
  },
  // The updated prompt instructs the AI to perform a more detailed analysis.
  prompt: `You are a food expert and encyclopedia. Analyze the provided image.
1. Identify the food item. Be specific if possible (e.g., "Vegetable Samosa" instead of just "Samosa").
2. Visually assess its safety. Look for mold, spoilage, or discoloration.
3. Provide a brief reason for your safety assessment.
4. Provide a short, interesting encyclopedic description or fact about the food.

Image: {{media url=photoDataUri}}`,
});

// Define the Genkit flow.
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
