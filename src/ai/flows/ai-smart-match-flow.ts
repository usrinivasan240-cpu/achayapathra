'use server';
/**
 * @fileOverview AI flow to match donations with NGO demand requests.
 * 
 * This flow analyzes food items against pre-booked requirements to find
 * the best possible matches based on quantity, proximity, and urgency.
 */

import { z } from 'genkit';
import { ai } from '../genkit';
import { googleAI } from '@genkit-ai/google-genai';

const DemandSchema = z.object({
  id: z.string(),
  foodType: z.string(),
  requiredQuantity: z.string(),
  urgency: z.enum(['Low', 'Medium', 'High', 'Critical']),
  minShelfLifeHours: z.number(),
  location: z.string(),
});

const DonationSchema = z.object({
  foodName: z.string(),
  foodType: z.string(),
  quantity: z.string(),
  expiryHoursRemaining: z.number(),
  location: z.string(),
});

const MatchResultSchema = z.object({
  demandId: z.string(),
  score: z.number().describe('A score from 0-100 representing match quality'),
  reasoning: z.string(),
});

const SmartMatchInputSchema = z.object({
  donation: DonationSchema,
  demands: z.array(DemandSchema),
});

const SmartMatchOutputSchema = z.object({
  matches: z.array(MatchResultSchema),
});

export type SmartMatchInput = z.infer<typeof SmartMatchInputSchema>;
export type SmartMatchOutput = z.infer<typeof SmartMatchOutputSchema>;

export async function aiSmartMatch(input: SmartMatchInput): Promise<SmartMatchOutput> {
  return aiSmartMatchFlow(input);
}

const smartMatchPrompt = ai.definePrompt({
  name: 'aiSmartMatchPrompt',
  model: googleAI.model('gemini-2.0-flash'),
  input: { schema: SmartMatchInputSchema },
  output: { schema: SmartMatchOutputSchema },
  prompt: `You are an AI logistics expert for a food redistribution network.
  
  Analyze the following donation and find the best matches among the provided NGO demands.
  
  Donation:
  - Name: {{{donation.foodName}}}
  - Type: {{{donation.foodType}}}
  - Qty: {{{donation.quantity}}}
  - Expiry: {{{donation.expiryHoursRemaining}}} hours
  - Location: {{{donation.location}}}
  
  NGO Demands:
  {{#each demands}}
  - ID: {{{id}}} | Type: {{{foodType}}} | Qty: {{{requiredQuantity}}} | Urgency: {{{urgency}}} | Min Shelf Life: {{{minShelfLifeHours}}}h | Location: {{{location}}}
  {{/each}}
  
  Criteria for scoring (0-100):
  1. Food Type compatibility (Must match or be very similar).
  2. Urgency: 'Critical' and 'High' should be prioritized.
  3. Shelf Life: Donation must have more hours remaining than the NGO's minimum requirement.
  4. Location: Proximity matters (assume closer is better if locations look similar).
  
  Provide a list of matches with scores and reasoning.`,
});

const aiSmartMatchFlow = ai.defineFlow(
  {
    name: 'aiSmartMatchFlow',
    inputSchema: SmartMatchInputSchema,
    outputSchema: SmartMatchOutputSchema,
  },
  async (input) => {
    const { output } = await smartMatchPrompt(input);
    return output!;
  }
);
