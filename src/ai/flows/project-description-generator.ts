'use server';
/**
 * @fileOverview An AI assistant flow for generating project descriptions.
 *
 * - generateProjectDescription - A function that generates project descriptions based on provided inputs.
 * - ProjectDescriptionGeneratorInput - The input type for the generateProjectDescription function.
 * - ProjectDescriptionGeneratorOutput - The return type for the generateProjectDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProjectDescriptionGeneratorInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  keywords: z.array(z.string()).describe('Key features or themes of the project.').default([]),
  techStack: z.array(z.string()).describe('Technologies used in the project.').default([]),
  projectGoals: z.string().describe('What the project aims to achieve or its primary purpose.'),
  tone: z.string().optional().describe('Optional: The desired tone for the description (e.g., professional, innovative, concise).'),
});
export type ProjectDescriptionGeneratorInput = z.infer<typeof ProjectDescriptionGeneratorInputSchema>;

const ProjectDescriptionGeneratorOutputSchema = z.object({
  longDescription: z
    .string()
    .describe(
      'A detailed project description (3-5 paragraphs), highlighting technical challenges, solutions, and impact, suitable for a dedicated project page.'
    ),
  shortDescription: z
    .string()
    .describe(
      'A concise, impactful 1-2 sentence summary of the project, suitable for a project card or overview section.'
    ),
});
export type ProjectDescriptionGeneratorOutput = z.infer<typeof ProjectDescriptionGeneratorOutputSchema>;

export async function generateProjectDescription(
  input: ProjectDescriptionGeneratorInput
): Promise<ProjectDescriptionGeneratorOutput> {
  return projectDescriptionGeneratorFlow(input);
}

const projectDescriptionPrompt = ai.definePrompt({
  name: 'projectDescriptionPrompt',
  input: { schema: ProjectDescriptionGeneratorInputSchema },
  output: { schema: ProjectDescriptionGeneratorOutputSchema },
  prompt: `You are an AI assistant specialized in writing compelling and engaging project descriptions for a professional developer's portfolio. Your goal is to help Rohan Bodkhe, an engineering student, web developer, and cybersecurity student, create content that showcases his skills and the impact of his projects.

Generate a long and a short description for a project based on the following information:

Project Name: {{{projectName}}}
Keywords/Key Features: {{#each keywords}}- {{this}}
{{/each}}
Tech Stack Used: {{#each techStack}}- {{this}}
{{/each}}
Project Goals/Purpose: {{{projectGoals}}}
{{#if tone}}
Desired Tone: {{{tone}}}
{{/if}}

Please provide two versions:
1.  A "longDescription" that is detailed, highlights the technical challenges, solutions, and impact, suitable for a dedicated project page. It should be 3-5 paragraphs long.
2.  A "shortDescription" that is a concise, impactful 1-2 sentence summary, suitable for a project card or overview section.

Ensure the language is professional, clear, and engaging. Focus on achievements and the value delivered.`,
});

const projectDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'projectDescriptionGeneratorFlow',
    inputSchema: ProjectDescriptionGeneratorInputSchema,
    outputSchema: ProjectDescriptionGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await projectDescriptionPrompt(input);
    return output!;
  }
);
