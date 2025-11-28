import { getCollection } from 'astro:content';
import { getLangFromEntry } from '../content/config';

/**
 * Gets the locale switch URL based on current path and available content
 * @param currentPath - The current page path (without /en or /zh prefix)
 * @param currentLang - The current language ('en' or 'zh')
 * @returns The URL to switch to in the other language
 */
export async function getLocaleSwitchUrl(currentPath: string, currentLang: 'en' | 'zh'): Promise<string> {
  const targetLang = currentLang === 'en' ? 'zh' : 'en';
  const targetDomain = targetLang === 'en' ? 'https://cheeseflow.com' : 'https://cheeseflow.cn';

  // Normalize path (remove leading/trailing slashes)
  const normalizedPath = currentPath.replace(/^\/+|\/+$/g, '');

  // Check if it's a blog post
  const blogPostMatch = normalizedPath.match(/^blog\/([^/]+)$/);

  if (blogPostMatch) {
    const slug = blogPostMatch[1];

    // Get all blog posts in the target language
    const targetPosts = await getCollection('blog', (entry) => getLangFromEntry(entry) === targetLang);

    // Check if a post with the same slug exists in the target language
    const correspondingPost = targetPosts.find((post) => {
      const postSlug = post.data.slug || post.slug.replace(/^(en|zh)\//, '');
      return postSlug === slug;
    });

    if (correspondingPost) {
      // Post exists in target language, link to it
      return `${targetDomain}/${normalizedPath}`;
    }
  }

  // For homepage
  if (normalizedPath === '' || normalizedPath === 'index.html') {
    return targetDomain;
  }

  // For blog listing page
  if (normalizedPath === 'blog' || normalizedPath.startsWith('blog/page/')) {
    return `${targetDomain}/${normalizedPath}`;
  }

  // For any other page, default to homepage
  return targetDomain;
}

/**
 * Client-side locale switcher - generates the switch URL based on current location
 * This is used in a script tag to make the locale switcher work client-side
 */
export function getClientLocaleSwitchUrl(currentLang: 'en' | 'zh'): string {
  const targetLang = currentLang === 'en' ? 'zh' : 'en';
  const targetDomain = targetLang === 'en' ? 'https://cheeseflow.com' : 'https://cheeseflow.cn';

  // Get current path without domain
  const currentPath = window.location.pathname;

  // For simplicity, just preserve the path
  // The middleware will handle the routing on the other domain
  return `${targetDomain}${currentPath}`;
}
