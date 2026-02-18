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
  prompt: `You are an expert food safety inspector and a culinary historian. Your task is to analyze the provided image of a food item. Compare what you see in the image to your extensive knowledge of food imagery to perform the following analysis.
    
**Analysis Steps:**
1.  **Identify the Food:** Clearly and specifically identify the food item in the image. If it's a dish, name it (e.g., "Chicken Biryani," not just "rice"). If it's a baked good, be specific (e.g., "Chocolate Croissant").
2.  **Conduct a Safety Assessment:** Meticulously examine the image for any signs of spoilage, such as mold, unusual discoloration, wilting, or drying. Based on this visual evidence, determine if the food appears safe for consumption.
3.  **Provide a Clear Rationale:** In the 'reason' field, state your conclusion clearly. Start with "Looks safe to eat" or "Caution advised". Then, provide a brief, one-sentence explanation for your assessment. For example: "Looks safe to eat because it appears fresh and has no visible signs of spoilage." or "Caution advised due to some discoloration on the edges."
4.  **Share a Culinary Fact:** In the 'description' field, provide a single, interesting, and concise encyclopedic fact about the identified food, its history, or its ingredients.

Return the analysis in the specified JSON format.

**Image for Analysis:**
{{media url=photoDataUri}}`,
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
    