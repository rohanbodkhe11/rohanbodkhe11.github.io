'use server';
/**
 * @fileOverview A Genkit flow for generating blog post outlines and content ideas.
 *
 * - generateBlogPostOutline - A function that handles the generation of a blog post outline.
 * - BlogPostOutlineGeneratorInput - The input type for the generateBlogPostOutline function.
 * - BlogPostOutlineGeneratorOutput - The return type for the generateBlogPostOutline function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BlogPostOutlineGeneratorInputSchema = z.object({
  topic: z.string().describe('The main topic of the blog post.'),
  targetAudience: z
    .string()
    .describe('The intended target audience for the blog post.'),
});
export type BlogPostOutlineGeneratorInput = z.infer<
  typeof BlogPostOutlineGeneratorInputSchema
>;

const BlogPostOutlineGeneratorOutputSchema = z.object({
  titleSuggestion: z.string().describe('A suggested title for the blog post.'),
  outline: z
    .array(
      z.object({
        sectionTitle: z
          .string()
          .describe('The title of a section in the blog post.'),
        contentIdeas: z
          .array(z.string())
          .describe('A list of content ideas or bullet points for this section.'),
      })
    )
    .describe('A structured outline of the blog post.'),
});
export type BlogPostOutlineGeneratorOutput = z.infer<
  typeof BlogPostOutlineGeneratorOutputSchema
>;

export async function generateBlogPostOutline(
  input: BlogPostOutlineGeneratorInput
): Promise<BlogPostOutlineGeneratorOutput> {
  return blogPostOutlineGeneratorFlow(input);
}

const blogPostOutlinePrompt = ai.definePrompt({
  name: 'blogPostOutlinePrompt',
  input: { schema: BlogPostOutlineGeneratorInputSchema },
  output: { schema: BlogPostOutlineGeneratorOutputSchema },
  prompt: `You are an AI assistant specialized in generating detailed blog post outlines and content ideas.
Your goal is to help Rohan Bodkhe efficiently plan and write high-quality blog content.

Generate a compelling blog post title and a structured outline based on the following information:

Topic: {{{topic}}}
Target Audience: {{{targetAudience}}}

The outline should include a suggested title and several main sections, with each section having 3-5 specific content ideas or bullet points. Focus on making the content engaging and relevant for the specified audience.

Example Output Format:
{
  "titleSuggestion": "Suggested Blog Post Title Here",
  "outline": [
    {
      "sectionTitle": "Introduction: Hook the Reader",
      "contentIdeas": [
        "Start with a compelling question related to the topic.",
        "Briefly introduce the main problem or challenge this post will address.",
        "State the purpose of the blog post and what the reader will learn."
      ]
    },
    {
      "sectionTitle": "Main Point 1: Deep Dive into ...",
      "contentIdeas": [
        "Explain concept A in detail.",
        "Provide an example or case study.",
        "Discuss the benefits or implications."
      ]
    }
  ]
}

Now, generate the title and outline for the given topic and audience:`,
});

const blogPostOutlineGeneratorFlow = ai.defineFlow(
  {
    name: 'blogPostOutlineGeneratorFlow',
    inputSchema: BlogPostOutlineGeneratorInputSchema,
    outputSchema: BlogPostOutlineGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await blogPostOutlinePrompt(input);
    if (!output) {
      throw new Error('Failed to generate blog post outline.');
    }
    return output;
  }
);
