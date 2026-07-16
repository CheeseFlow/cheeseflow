import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import sitemap from '@astrojs/sitemap';

const EN_ORIGIN = 'https://cheeseflow.com';
const ZH_ORIGIN = 'https://cheeseflow.cn';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) =>
        !page.includes('/draft/') && !/\/blog\/1\/?$/.test(page),
      changefreq: 'weekly',
      priority: 0.7,
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          zh: 'zh',
        },
      },
      serialize(item) {
        const url = new URL(item.url);
        const path = url.pathname;
        const isZh = path.startsWith('/zh');
        const origin = isZh ? ZH_ORIGIN : EN_ORIGIN;
        item.url = `${origin}${path}`;

        if (path.startsWith('/en') || path.startsWith('/zh')) {
          const enPath = path.startsWith('/zh')
            ? path.replace(/^\/zh/, '/en')
            : path;
          const zhPath = path.startsWith('/en')
            ? path.replace(/^\/en/, '/zh')
            : path;
          item.links = [
            { url: `${EN_ORIGIN}${enPath}`, lang: 'en' },
            { url: `${ZH_ORIGIN}${zhPath}`, lang: 'zh' },
          ];
        }

        return item;
      },
    }),
  ],
  output: 'static',
  site: 'https://cheeseflow.com',
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  vite: {
    server: {
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
      },
    },
  },
});
