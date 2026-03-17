import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export const prerender = true;

export async function GET(context: { site: URL | undefined }) {
  const posts = await getCollection('blog-zh');
  const sorted = [...posts].sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );
  return rss({
    title: 'CheeseFlow 芝士溪谷 - 博客',
    description:
      '品牌策略、设计与营销洞察。用创意提升您的品牌。',
    site: context.site ?? new URL('https://cheeseflow.com'),
    items: sorted.map((post) => ({
      title: post.data.title,
      description:
        post.data.description ?? post.data.excerpt ?? 'CheeseFlow 博客文章。',
      pubDate: post.data.date,
      link: `/zh/${post.data.slug ?? post.slug}/`,
    })),
    customData: '<language>zh-cn</language>',
  });
}
