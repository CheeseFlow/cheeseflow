import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: 'static',
  adapter: cloudflare(),
  site: 'https://cheeseflow.com',
  // Configure image service to compile at build time for Cloudflare compatibility
  image: {
    service: {
      entrypoint: 'astro/assets/services/compile'
    }
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
