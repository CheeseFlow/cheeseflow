import { defineMiddleware } from "astro:middleware";

function getLocaleFromDomain(url: URL): string {
  const hostname = url.hostname;

  if (hostname.endsWith('.com.cn') || hostname.endsWith('.cn') || hostname === 'cheeseflow.cn') {
    return 'zh';
  }

  return 'en';
}

function stripLocaleFromPath(pathname: string): string {
  const hasTrailingSlash = pathname.endsWith('/') && pathname !== '/';
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return '/';
  }

  if (segments[0] === 'en' || segments[0] === 'zh') {
    segments.shift();
  }

  const path = segments.length ? `/${segments.join('/')}` : '/';
  return hasTrailingSlash && path !== '/' ? `${path}/` : path;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = context.url;
  const pathname = url.pathname;

  // Skip middleware for static assets
  if (pathname.startsWith('/_astro/') ||
      pathname.startsWith('/favicon.') ||
      pathname.startsWith('/images/') ||
      pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot)$/)) {
    return next();
  }

  // Get locale from domain
  // .com → en, .cn/.com.cn → zh
  const locale = getLocaleFromDomain(url);

  // Check if path already has a locale prefix
  const pathLocale = pathname.split('/').filter(Boolean)[0];
  const hasLocalePrefix = pathLocale === 'en' || pathLocale === 'zh';

  // SCENARIO 1: Path already has correct locale prefix (e.g., cheeseflow.com/en/blog)
  // Just serve it - no redirect needed
  if (hasLocalePrefix && pathLocale === locale) {
    return next();
  }

  // SCENARIO 2: User accesses wrong locale on wrong domain (e.g., cheeseflow.com/zh/blog)
  // Redirect to correct domain with clean URL
  if (hasLocalePrefix && pathLocale !== locale) {
    const cleanPath = stripLocaleFromPath(pathname);
    const correctDomain = locale === 'zh' ? 'cheeseflow.cn' : 'cheeseflow.com';
    const cleanUrl = new URL(cleanPath, `https://${correctDomain}`);
    cleanUrl.search = url.search;
    return context.redirect(cleanUrl.toString(), 301);
  }

  // SCENARIO 3: User accesses clean URL without locale prefix (e.g., cheeseflow.com/blog)
  // Rewrite internally to localized path (/en/blog) for routing, but URL stays clean
  if (!hasLocalePrefix) {
    const localisedPath = pathname === '/' ? `/${locale}/` : `/${locale}${pathname}`;
    // Add query string if present
    const fullPath = url.search ? `${localisedPath}${url.search}` : localisedPath;
    // Use Astro's rewrite - this will trigger middleware again,
    // but Scenario 1 will just call next() and serve the page
    return context.rewrite(fullPath);
  }

  return next();
});
