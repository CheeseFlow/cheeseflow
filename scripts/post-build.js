#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

// Copy sitemap-index.xml to sitemap.xml for standard SEO compatibility
const sitemapIndexPath = path.join(distDir, 'sitemap-index.xml');
const sitemapPath = path.join(distDir, 'sitemap.xml');

if (fs.existsSync(sitemapIndexPath)) {
  fs.copyFileSync(sitemapIndexPath, sitemapPath);
  console.log('✓ Created sitemap.xml from sitemap-index.xml');
} else {
  console.warn('⚠ sitemap-index.xml not found, skipping sitemap.xml creation');
}
