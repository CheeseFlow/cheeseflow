import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export const prerender = true;

export async function GET(context: { site: URL | undefined }) {
  const posts = await getCollection('blog-en');
  const sorted = [...posts].sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );
  const siteUrl = context.site ?? new URL('https://cheeseflow.com');
  return rss({
    title: 'CheeseFlow 芝士溪谷 - Blog',
    description:
      'Brand strategy, design, and marketing insights. Improve your brand with creative ideas.',
    site: siteUrl,
    items: sorted.map((post) => ({
      title: post.data.title,
      description:
        post.data.description ?? post.data.excerpt ?? 'CheeseFlow blog post.',
      pubDate: post.data.date,
      link: new URL(`/en/${post.data.slug ?? post.id}/`, siteUrl).href,
    })),
    customData: '<language>en-gb</language>',
  });
}
