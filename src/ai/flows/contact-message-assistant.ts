'use server';
/**
 * @fileOverview An AI assistant for categorizing and summarizing incoming contact messages.
 *
 * - aiContactMessageAssistant - A function that handles the categorization and summarization of contact messages.
 * - AiContactMessageAssistantInput - The input type for the aiContactMessageAssistant function.
 * - AiContactMessageAssistantOutput - The return type for the aiContactMessageAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiContactMessageAssistantInputSchema = z.object({
  name: z.string().describe('The name of the sender.'),
  email: z.string().email().describe('The email address of the sender.'),
  subject: z.string().describe('The subject line of the contact message.'),
  message: z.string().describe('The full content of the contact message.'),
});
export type AiContactMessageAssistantInput = z.infer<typeof AiContactMessageAssistantInputSchema>;

const AiContactMessageAssistantOutputSchema = z.object({
  category: z.enum([
    'Job Inquiry',
    'Collaboration Request',
    'General Feedback',
    'Bug Report',
    'Support Request',
    'Partnership Opportunity',
    'Media Inquiry',
    'Other',
  ]).describe('The category that best describes the intent of the message.'),
  summary: z
    .string()
    .describe('A brief, concise summary of the contact message content.'),
});
export type AiContactMessageAssistantOutput = z.infer<typeof AiContactMessageAssistantOutputSchema>;

export async function aiContactMessageAssistant(
  input: AiContactMessageAssistantInput
): Promise<AiContactMessageAssistantOutput> {
  return aiContactMessageAssistantFlow(input);
}

const contactMessageAssistantPrompt = ai.definePrompt({
  name: 'contactMessageAssistantPrompt',
  input: {schema: AiContactMessageAssistantInputSchema},
  output: {schema: AiContactMessageAssistantOutputSchema},
  prompt: `You are an AI assistant designed to help categorize and summarize incoming contact messages.

Analyze the following contact message and determine its primary category from the following options: 'Job Inquiry', 'Collaboration Request', 'General Feedback', 'Bug Report', 'Support Request', 'Partnership Opportunity', 'Media Inquiry', 'Other'.
Then, provide a brief, concise summary of the message content.

--- Contact Message Details ---
Sender Name: {{{name}}}
Sender Email: {{{email}}}
Subject: {{{subject}}}
Message: {{{message}}}

Ensure your response is in JSON format, strictly following the provided schema.
`,
});

const aiContactMessageAssistantFlow = ai.defineFlow(
  {
    name: 'aiContactMessageAssistantFlow',
    inputSchema: AiContactMessageAssistantInputSchema,
    outputSchema: AiContactMessageAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await contactMessageAssistantPrompt(input);
    return output!;
  }
);
