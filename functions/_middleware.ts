// Cloudflare Pages Function for domain-based language routing

function getDefaultLocaleFromDomain(hostname: string): string {
  if (hostname.endsWith('.com.cn') || hostname.endsWith('.cn') || hostname === 'cheeseflow.cn') {
    return 'zh';
  }
  return 'en';
}

export async function onRequest(context: any): Promise<Response> {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  const hostname = url.hostname;

  // Skip middleware for static assets
  if (pathname.startsWith('/_astro/') ||
      pathname.startsWith('/favicon.') ||
      pathname.startsWith('/images/') ||
      pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot)$/)) {
    return await context.next();
  }

  // Get default locale for this domain
  const defaultLocale = getDefaultLocaleFromDomain(hostname);

  // Check if path has a locale prefix
  const pathSegments = pathname.split('/').filter(Boolean);
  const pathLocale = (pathSegments[0] === 'en' || pathSegments[0] === 'zh') ? pathSegments[0] : null;

  // CASE 1: Root path (/) - redirect to default locale
  if (pathname === '/') {
    return Response.redirect(`${url.origin}/${defaultLocale}/`, 302);
  }

  // CASE 2: Wrong locale on wrong domain - redirect to correct domain
  // .com/zh/* → .cn/zh/*
  // .cn/en/* or .com.cn/en/* → .com/en/*
  if (pathLocale) {
    const isCnDomain = hostname.endsWith('.cn') || hostname.endsWith('.com.cn');
    const isComDomain = !isCnDomain;

    if (isComDomain && pathLocale === 'zh') {
      // Redirect .com/zh to .cn/zh
      const newUrl = new URL(pathname, 'https://cheeseflow.cn');
      newUrl.search = url.search;
      return Response.redirect(newUrl.toString(), 301);
    }

    if (isCnDomain && pathLocale === 'en') {
      // Redirect .cn/en to .com/en
      const newUrl = new URL(pathname, 'https://cheeseflow.com');
      newUrl.search = url.search;
      return Response.redirect(newUrl.toString(), 301);
    }
  }

  // CASE 3: No locale prefix - redirect to default locale
  if (!pathLocale) {
    return Response.redirect(`${url.origin}/${defaultLocale}${pathname}`, 302);
  }

  // CASE 4: Canonicalise /blog/1 → /blog (page 1 lives at the index)
  if (pathLocale && /^\/(en|zh)\/blog\/1\/?$/.test(pathname)) {
    const target = new URL(`/${pathLocale}/blog/`, url.origin);
    target.search = url.search;
    return Response.redirect(target.toString(), 301);
  }

  // CASE 5: Correct locale on correct domain - serve the page
  return await context.next();
}
