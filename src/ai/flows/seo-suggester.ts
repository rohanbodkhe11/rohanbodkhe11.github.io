'use server';
/**
 * @fileOverview An AI assistant flow to suggest SEO keywords and meta descriptions.
 *
 * - suggestSeoDetails - A function that handles the SEO suggestion process.
 * - SeoSuggesterInput - The input type for the suggestSeoDetails function.
 * - SeoSuggesterOutput - The return type for the suggestSeoDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SeoSuggesterInputSchema = z.object({
  title: z.string().describe('The title of the project or blog post.'),
  description: z
    .string()
    .describe('A short description or excerpt of the project or blog post.'),
  content: z
    .string()
    .describe('The full content of the project or blog post (can be HTML).')
    .optional(),
});
export type SeoSuggesterInput = z.infer<typeof SeoSuggesterInputSchema>;

const SeoSuggesterOutputSchema = z.object({
  keywords: z
    .array(z.string())
    .describe('A list of relevant SEO keywords, up to 10.'),
  metaDescription: z
    .string()
    .describe(
      'A concise meta description (up to 160 characters) optimized for search engines.'
    ),
});
export type SeoSuggesterOutput = z.infer<typeof SeoSuggesterOutputSchema>;

export async function suggestSeoDetails(
  input: SeoSuggesterInput
): Promise<SeoSuggesterOutput> {
  return seoSuggesterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'seoSuggesterPrompt',
  input: {schema: SeoSuggesterInputSchema},
  output: {schema: SeoSuggesterOutputSchema},
  prompt: `You are an expert SEO assistant. Based on the following content, generate relevant SEO keywords and a concise meta description.

Instructions:
- Generate up to 10 relevant keywords.
- The meta description should be a single sentence, no more than 160 characters, and enticing for search engines.

Title: {{{title}}}
Description: {{{description}}}
Content: {{{content}}}`,
});

const seoSuggesterFlow = ai.defineFlow(
  {
    name: 'seoSuggesterFlow',
    inputSchema: SeoSuggesterInputSchema,
    outputSchema: SeoSuggesterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
