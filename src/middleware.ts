import { defineMiddleware } from "astro:middleware";

function getLocaleFromDomain(url: URL): string {
  const hostname = url.hostname;

  if (hostname.endsWith('.com.cn') || hostname.endsWith('.cn') || hostname === 'cheeseflow.cn') {
    return 'zh';
  }

  return 'en';
}

function stripLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return '/';
  }

  if (segments[0] === 'en' || segments[0] === 'zh') {
    segments.shift();
  }

  return segments.length ? `/${segments.join('/')}` : '/';
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
  const locale = getLocaleFromDomain(url);

  // Check if path already has a locale prefix
  const pathLocale = pathname.split('/').filter(Boolean)[0];
  const hasLocalePrefix = pathLocale === 'en' || pathLocale === 'zh';

  // If the path already has a locale prefix that matches the domain, redirect to clean URL
  if (hasLocalePrefix && pathLocale === locale) {
    const cleanPath = stripLocaleFromPath(pathname);
    const cleanUrl = new URL(cleanPath, url);
    cleanUrl.search = url.search;
    return context.redirect(cleanUrl.toString(), 301);
  }

  // If the path has a different locale prefix, redirect to correct domain
  if (hasLocalePrefix && pathLocale !== locale) {
    const cleanPath = stripLocaleFromPath(pathname);
    const correctDomain = locale === 'zh' ? 'cheeseflow.cn' : 'cheeseflow.com';
    const cleanUrl = new URL(cleanPath, `https://${correctDomain}`);
    cleanUrl.search = url.search;
    return context.redirect(cleanUrl.toString(), 301);
  }

  // If no locale prefix, rewrite internally to the localized path
  if (!hasLocalePrefix) {
    const cleanPath = stripLocaleFromPath(pathname);
    const localisedPath = cleanPath === '/' ? `/${locale}` : `/${locale}${cleanPath}`;
    // Modify the URL pathname to rewrite internally
    context.url.pathname = localisedPath;
  }

  return next();
});
