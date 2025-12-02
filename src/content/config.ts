import { defineCollection, z } from 'astro:content';

const blogSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  lang: z.enum(['en', 'zh']).optional(),
  translated: z.boolean().default(false),
  description: z.string().optional(),
  date: z.coerce.date(),
  readingTime: z.number().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).default([]),
  author: z.string().optional(),
  excerpt: z.string().optional(),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
});

const blogEn = defineCollection({
  type: 'content',
  schema: blogSchema,
});

const blogZh = defineCollection({
  type: 'content',
  schema: blogSchema,
});

export const collections = {
  'blog-en': blogEn,
  'blog-zh': blogZh,
};

