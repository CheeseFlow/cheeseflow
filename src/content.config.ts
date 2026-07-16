import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
  loader: glob({ pattern: '**/*.md', base: './src/content/blog-en' }),
  schema: blogSchema,
});

const blogZh = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog-zh' }),
  schema: blogSchema,
});

export const collections = {
  'blog-en': blogEn,
  'blog-zh': blogZh,
};

