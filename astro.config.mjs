import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => !page.includes('/draft/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  output: 'static',
  site: 'https://cheeseflow.com',
  // Enable prefetching for faster navigation
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },
  // Improve content collection cache handling and file watching
  vite: {
    server: {
      watch: {
        // Ignore unnecessary directories to improve performance
        ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
      },
    },
  },
});