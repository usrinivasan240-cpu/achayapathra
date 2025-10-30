'use server';

/**
 * @fileOverview A flow to summarize available donations for receivers/NGOs.
 *
 * - summarizeDonationRequests - A function that handles the summarization of donation requests.
 * - SummaryOfDonationRequestsInput - The input type for the summarizeDonationRequests function.
 * - SummaryOfDonationRequestsOutput - The return type for the summarizeDonationRequests function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummaryOfDonationRequestsInputSchema = z.object({
  donationRequests: z.array(
    z.object({
      foodName: z.string().describe('The name of the food being donated.'),
      foodType: z.string().describe('The type of food (e.g., cooked, canned).'),
      quantity: z.string().describe('The quantity of food available.'),
      expiryTime: z.string().describe('The expiration date/time of the food.'),
      description: z.string().optional().describe('Additional details about the donation.'),
    })
  ).describe('A list of donation requests to summarize.'),
});
export type SummaryOfDonationRequestsInput = z.infer<typeof SummaryOfDonationRequestsInputSchema>;

const SummaryOfDonationRequestsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the available donations, highlighting food type, quantity, and expiration dates.'),
});
export type SummaryOfDonationRequestsOutput = z.infer<typeof SummaryOfDonationRequestsOutputSchema>;

export async function summarizeDonationRequests(input: SummaryOfDonationRequestsInput): Promise<SummaryOfDonationRequestsOutput> {
  return summarizeDonationRequestsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDonationRequestsPrompt',
  input: {schema: SummaryOfDonationRequestsInputSchema},
  output: {schema: SummaryOfDonationRequestsOutputSchema},
  prompt: `You are an AI assistant helping NGOs and receivers quickly understand available food donations.

  Summarize the following donation requests, highlighting the food type, quantity, and expiration dates. Focus on providing a concise overview that allows users to quickly assess the relevance of each donation.

  Donation Requests:
  {{#each donationRequests}}
  - Food: {{foodName}}, Type: {{foodType}}, Quantity: {{quantity}}, Expires: {{expiryTime}}
  {{#if description}}, Description: {{description}}{{/if}}
  {{/each}}
  `,
});

const summarizeDonationRequestsFlow = ai.defineFlow(
  {
    name: 'summarizeDonationRequestsFlow',
    inputSchema: SummaryOfDonationRequestsInputSchema,
    outputSchema: SummaryOfDonationRequestsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
