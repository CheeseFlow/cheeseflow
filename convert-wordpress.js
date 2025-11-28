import { XMLParser } from 'fast-xml-parser';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import TurndownService from 'turndown';

// Local environment lacks trusted CAs for cheeseflow.com downloads
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    if (!arg.includes('=')) return [arg.replace(/^--/, ''), true];
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    return [key, rest.join('=')];
  })
);

const xmlPath = args.xml || '/Users/valiant/Downloads/cheeseflow.WordPress.2025-11-27.xml';
const lang = (args.lang || 'en').toLowerCase();
if (!['en', 'zh'].includes(lang)) {
  throw new Error(`Unsupported lang "${lang}". Use "en" or "zh".`);
}
const translatedFlag = args.translated === true
  ? true
  : args.translated
  ? args.translated === 'true'
  : lang !== 'en';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

turndownService.addRule('wordpressBlocks', {
  filter(node) {
    return node.nodeType === 8 && node.nodeValue && node.nodeValue.includes('wp:');
  },
  replacement() {
    return '';
  },
});

const xmlContent = readFileSync(xmlPath, 'utf-8');
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  ignoreNameSpace: false,
  parseAttributeValue: true,
  trimValues: true,
});

const parsed = parser.parse(xmlContent);
const channel = parsed.rss.channel;
const items = Array.isArray(channel.item) ? channel.item : [channel.item];

const attachmentMap = new Map();
for (const item of items) {
  if (item['wp:post_type'] !== 'attachment') continue;
  const postId = String(item['wp:post_id']);
  const attachmentUrl = item['wp:attachment_url'];
  let altText = '';
  const postmeta = item['wp:postmeta'];
  if (postmeta) {
    const entries = Array.isArray(postmeta) ? postmeta : [postmeta];
    for (const meta of entries) {
      if (meta['wp:meta_key'] === '_wp_attachment_image_alt') {
        altText = meta['wp:meta_value'] || '';
        break;
      }
    }
  }
  attachmentMap.set(postId, {
    url: attachmentUrl,
    alt: altText || item.title || '',
  });
}

const blogPosts = [];
for (const item of items) {
  if (item['wp:post_type'] !== 'post' || item['wp:status'] !== 'publish') {
    continue;
  }

  const categories = [];
  const tags = [];
  if (item.category) {
    const cats = Array.isArray(item.category) ? item.category : [item.category];
    for (const cat of cats) {
      if (cat['@_domain'] === 'category') {
        categories.push(cat['#text'] || cat);
      } else if (cat['@_domain'] === 'post_tag') {
        tags.push(cat['#text'] || cat);
      }
    }
  }

  let thumbnailId = null;
  if (item['wp:postmeta']) {
    const postmeta = Array.isArray(item['wp:postmeta'])
      ? item['wp:postmeta']
      : [item['wp:postmeta']];
    for (const meta of postmeta) {
      if (meta['wp:meta_key'] === '_thumbnail_id') {
        thumbnailId = String(meta['wp:meta_value']);
        break;
      }
    }
  }

  let excerpt = item['excerpt:encoded'] || '';
  if (!excerpt && item['content:encoded']) {
    const contentMatch = item['content:encoded'].match(/<p[^>]*>(.*?)<\/p>/i);
    if (contentMatch) {
      excerpt = contentMatch[1].replace(/<[^>]+>/g, '').trim();
    }
  }

  const slug = item['wp:post_name'] || `post-${item['wp:post_id']}`;

  blogPosts.push({
    title: item.title || '',
    slug,
    date: item['wp:post_date'] ? item['wp:post_date'].split(' ')[0] : '',
    categories,
    tags,
    author: item['dc:creator'] || '',
    excerpt: excerpt.trim(),
    content: item['content:encoded'] || '',
    featuredImage: thumbnailId ? attachmentMap.get(thumbnailId) : null,
  });
}

console.log(`Found ${blogPosts.length} blog posts`);

const blogDir = join(__dirname, 'src', 'content', 'blog', lang);
// Images should be in src/assets for source control
const imagesDir = join(__dirname, 'src', 'assets', 'images', 'blog', lang);
// Also copy to public for markdown references (markdown can't import assets directly)
const publicImagesDir = join(__dirname, 'public', 'images', 'blog', lang);
mkdirSync(blogDir, { recursive: true });
mkdirSync(imagesDir, { recursive: true });
mkdirSync(publicImagesDir, { recursive: true });

function buildImageDownloadInfo(url) {
  try {
    const urlObj = new URL(url);
    const fileName = basename(urlObj.pathname);
    const originalName = fileName.replace(/-\d+x\d+(?=\.[^.]+$)/, '');
    const candidates = [];
    if (originalName !== fileName) {
      const originalPath = urlObj.pathname.replace(fileName, originalName);
      candidates.push(`${urlObj.origin}${originalPath}`);
    }
    candidates.push(url);
    return {
      candidates: [...new Set(candidates)],
      fileName: originalName || fileName,
    };
  } catch {
    return {
      candidates: [url],
      fileName: basename(url),
    };
  }
}

function deriveAltFromSrc(src) {
  const format = (value) => {
    const cleaned = value
      .replace(/\.[^.]+$/, '')
      .replace(/[._-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleaned) return 'Image';
    return cleaned
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  try {
    const urlObj = new URL(src, 'https://placeholder.local');
    return format(decodeURIComponent(basename(urlObj.pathname)));
  } catch {
    return format(src.split('/').pop() || 'Image');
  }
}

function copyToPublic(imagePath, fileName) {
  const publicPath = join(publicImagesDir, fileName);
  mkdirSync(dirname(publicPath), { recursive: true });
  const buffer = readFileSync(imagePath);
  writeFileSync(publicPath, buffer);
}

async function downloadImage(urlCandidates, destPath) {
  for (const url of urlCandidates) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download ${url}: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      writeFileSync(destPath, buffer);
      return true;
    } catch (error) {
      console.error(`Error downloading ${url}:`, error.message);
    }
  }
  console.error(`All download attempts failed for ${urlCandidates[0]}`);
  return false;
}

function extractImageUrls(html) {
  const urls = new Set();
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    urls.add(match[1]);
  }
  const wpImageRegex = /<!-- wp:image[^>]*-->[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = wpImageRegex.exec(html)) !== null) {
    urls.add(match[1]);
  }
  return Array.from(urls);
}

for (const post of blogPosts) {
  console.log(`Processing: ${post.slug}`);

  let coverPath = null;
  let coverAlt = null;
  if (post.featuredImage) {
    const imageUrl = post.featuredImage.url;
    const { candidates, fileName } = buildImageDownloadInfo(imageUrl);
    const imagePath = join(imagesDir, fileName);

    let downloaded = true;
    if (!existsSync(imagePath)) {
      console.log(`  Downloading featured image: ${fileName}`);
      downloaded = await downloadImage(candidates, imagePath);
    }

    if (downloaded && existsSync(imagePath)) {
      copyToPublic(imagePath, fileName);
      coverPath = `/images/blog/${lang}/${fileName}`;
      const providedAlt = (post.featuredImage.alt || '').trim();
      const normalizedFileName = fileName.replace(/\.[^.]+$/, '').toLowerCase();
      if (
        !providedAlt ||
        providedAlt.toLowerCase() === normalizedFileName ||
        providedAlt.toLowerCase() === fileName.toLowerCase()
      ) {
        coverAlt = deriveAltFromSrc(fileName);
      } else {
        coverAlt = providedAlt;
      }
    }
  }

  const imageUrls = extractImageUrls(post.content);
  const imageMap = new Map();
  for (const imageUrl of imageUrls) {
    if (!imageUrl.includes('/wp-content/uploads/')) continue;
    const { candidates, fileName } = buildImageDownloadInfo(imageUrl);
    const imagePath = join(imagesDir, fileName);

    if (imageMap.has(imageUrl)) continue;

    let downloaded = true;
    if (!existsSync(imagePath)) {
      console.log(`  Downloading content image: ${fileName}`);
      downloaded = await downloadImage(candidates, imagePath);
    }

    if (downloaded && existsSync(imagePath)) {
      copyToPublic(imagePath, fileName);
      imageMap.set(imageUrl, `/images/blog/${lang}/${fileName}`);
    }
  }

  let processedContent = post.content;
  for (const [originalUrl, localPath] of imageMap.entries()) {
    processedContent = processedContent.replace(
      new RegExp(originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      localPath
    );
  }

  processedContent = processedContent
    .replace(/<!--\s*wp:[^>]*-->/g, '')
    .replace(/<!--\s*\/wp:[^>]*-->/g, '');

  processedContent = processedContent.replace(
    /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi,
    (_match, src, alt) => {
      const altText = alt && alt.trim() ? alt.trim() : deriveAltFromSrc(src);
      return `![${altText}](${src})`;
    }
  );

  processedContent = processedContent.replace(
    /<figure[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>[\s\S]*?(?:<figcaption[^>]*>([\s\S]*?)<\/figcaption>)?[\s\S]*?<\/figure>/gi,
    (_match, src, alt, caption) => {
      const altText = alt && alt.trim() ? alt.trim() : deriveAltFromSrc(src);
      const captionText = caption ? caption.trim() : '';
      if (captionText) {
        return `![${altText}](${src})\n\n*${captionText}*`;
      }
      return `![${altText}](${src})`;
    }
  );

  let markdown = turndownService.turndown(processedContent);
  markdown = markdown.replace(/!\\?\[\\?\]\\?\(/g, '![](');
  markdown = markdown.replace(/!\\?\[([^\]]*?)\]\\?\(/g, '![$1](');
  markdown = markdown.replace(/!\[([^\]]*?)\\]\(/g, '![$1](');
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

  const frontmatter = {
    title: post.title,
    slug: post.slug,
    lang,
    translated: translatedFlag,
    date: post.date,
    categories: post.categories.length ? post.categories : undefined,
    tags: post.tags.length ? post.tags : undefined,
    author: post.author || undefined,
    excerpt: post.excerpt || undefined,
    cover: coverPath || undefined,
    coverAlt: coverAlt || undefined,
  };

  Object.keys(frontmatter).forEach((key) => {
    if (frontmatter[key] === undefined) delete frontmatter[key];
  });

  const order = [
    'title',
    'slug',
    'lang',
    'translated',
    'date',
    'categories',
    'tags',
    'author',
    'excerpt',
    'cover',
    'coverAlt',
  ];

  const formatValue = (value) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      return `[${value.map((v) => `"${String(v).replace(/"/g, '\\"')}"`).join(', ')}]`;
    }
    if (typeof value === 'string') {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    return value;
  };

  const frontmatterLines = ['---'];
  for (const key of order) {
    if (!(key in frontmatter)) continue;
    const formatted = formatValue(frontmatter[key]);
    if (formatted === null || formatted === undefined) continue;
    frontmatterLines.push(`${key}: ${formatted}`);
  }
  frontmatterLines.push('---');

  const markdownContent = `${frontmatterLines.join('\n')}\n\n${markdown}\n`;
  const outputPath = join(blogDir, `${post.slug}.md`);
  writeFileSync(outputPath, markdownContent, 'utf-8');

  console.log(`  ✓ Created: ${post.slug}.md`);
}

console.log('\nConversion complete!');
