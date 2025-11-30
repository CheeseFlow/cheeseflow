/**
 * Cloudflare Pages Function to handle domain-based routing with hidden language prefixes
 * - cheeseflow.com/* → internally serves /en/* (prefix hidden from users)
 * - cheeseflow.com.cn/* → internally serves /zh/* (prefix hidden from users)
 * - cheeseflow.cn/* → internally serves /zh/* (prefix hidden from users)
 * - Wrong language on wrong domain → redirects to correct domain
 */
export async function onRequest(context: {
  request: Request;
  next: () => Promise<Response>;
  env: { ASSETS: { fetch: (request: Request) => Promise<Response> } };
}) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const hostname = url.hostname;

  // Determine language from domain
  const isChinese =
    hostname.endsWith('.com.cn') ||
    hostname.endsWith('.cn') ||
    hostname === 'cheeseflow.cn';

  const lang = isChinese ? 'zh' : 'en';
  const correctDomain = isChinese ? 'cheeseflow.cn' : 'cheeseflow.com';

  // Check if user is trying to access wrong language on this domain
  if (url.pathname.startsWith('/zh/') || url.pathname === '/zh') {
    if (!isChinese) {
      // Redirect .com/zh to .cn
      const newUrl = new URL(url.pathname.replace(/^\/zh/, '') || '/', `https://${correctDomain}`);
      newUrl.search = url.search;
      return Response.redirect(newUrl, 301);
    }
  }
  if (url.pathname.startsWith('/en/') || url.pathname === '/en') {
    if (isChinese) {
      // Redirect .cn/en to .com
      const newUrl = new URL(url.pathname.replace(/^\/en/, '') || '/', `https://${correctDomain}`);
      newUrl.search = url.search;
      return Response.redirect(newUrl, 301);
    }
  }

  // If path already has the correct language prefix, serve it
  if (url.pathname.startsWith(`/${lang}/`) || url.pathname === `/${lang}`) {
    return next();
  }

  // Skip rewriting for static assets
  if (url.pathname.startsWith('/_astro/') ||
      url.pathname.startsWith('/favicon.') ||
      url.pathname.startsWith('/images/') ||
      url.pathname.includes('.')) {
    return next();
  }

  // Rewrite path to include language prefix internally
  let internalPath = url.pathname;
  if (internalPath === '/' || internalPath === '') {
    internalPath = `/${lang}/`;
  } else {
    // Add language prefix for internal routing
    internalPath = `/${lang}${internalPath.startsWith('/') ? '' : '/'}${internalPath}`;
    // Ensure trailing slash for directory paths to match index.html files
    if (!internalPath.endsWith('/') && !internalPath.includes('.')) {
      internalPath += '/';
    }
  }

  // Create a new request with the rewritten path for static assets
  const internalUrl = new URL(internalPath + url.search, url.origin);
  const internalRequest = new Request(internalUrl, request);

  // Fetch from static assets using env.ASSETS
  return env.ASSETS.fetch(internalRequest);
}

