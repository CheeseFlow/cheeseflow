import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    readingTime: z.number().optional(),
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
  }),
});

export const collections = { blog };

