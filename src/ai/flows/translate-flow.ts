'use server';
/**
 * @fileOverview AI flow to translate text between Tamil and English.
 * 
 * This flow handles language translation for food descriptions, NGO requirements,
 * and volunteer messages to bridge communication gaps in local communities.
 */

import { z } from 'genkit';
import { ai } from '../genkit';
import { googleAI } from '@genkit-ai/google-genai';

const TranslateInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.enum(['Tamil', 'English']).describe('The language to translate into.'),
});
export type TranslateInput = z.infer<typeof TranslateInputSchema>;

const TranslateOutputSchema = z.object({
  translatedText: z.string().describe('The resulting translated text.'),
});
export type TranslateOutput = z.infer<typeof TranslateOutputSchema>;

export async function translateText(input: TranslateInput): Promise<TranslateOutput> {
  return translateFlow(input);
}

const translatePrompt = ai.definePrompt({
  name: 'translatePrompt',
  model: googleAI.model('gemini-2.0-flash'),
  input: { schema: TranslateInputSchema },
  output: { schema: TranslateOutputSchema },
  prompt: `You are a professional translator specialized in Tamil and English, working for "Achayapathra", a food redistribution platform.
  
  Translate the following text into {{targetLanguage}}. 
  Ensure the translation is culturally appropriate, maintains the original meaning, tone, and formatting.
  Pay special attention to food-related terminology and local context.
  
  Text: {{text}}`,
});

const translateFlow = ai.defineFlow(
  {
    name: 'translateFlow',
    inputSchema: TranslateInputSchema,
    outputSchema: TranslateOutputSchema,
  },
  async (input) => {
    const { output } = await translatePrompt(input);
    if (!output) throw new Error('Translation failed to generate output.');
    return output;
  }
);
