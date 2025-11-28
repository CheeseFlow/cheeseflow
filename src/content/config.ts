import { defineCollection, z } from 'astro:content';

// Helper to derive language from entry path
export function getLangFromEntry(entry: { 
  id: string; 
  slug: string;
  data: { lang?: 'en' | 'zh' } 
}): 'en' | 'zh' {
  // Use frontmatter lang if provided
  if (entry.data?.lang) return entry.data.lang;
  
  // The id property contains the file path relative to the collection root
  // Format: "en/filename" or "zh/filename" for files in subdirectories
  // Check id first as it's most reliable
  if (entry.id) {
    // Check if id starts with language code
    if (entry.id.startsWith('en/')) return 'en';
    if (entry.id.startsWith('zh/')) return 'zh';
    
    // Check if id contains language directory anywhere
    if (entry.id.includes('/en/')) return 'en';
    if (entry.id.includes('/zh/')) return 'zh';
  }
  
  // Fallback: check slug (file-based slug, not frontmatter slug)
  // Slug format: "en/filename" or "zh/filename" for files in subdirectories
  if (entry.slug) {
    if (entry.slug.startsWith('en/')) return 'en';
    if (entry.slug.startsWith('zh/')) return 'zh';
  }
  
  // Default to English
  return 'en';
}

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    lang: z.enum(['en', 'zh']).optional(), // Optional - derived from path if not provided
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
  }),
});

export const collections = { blog };

