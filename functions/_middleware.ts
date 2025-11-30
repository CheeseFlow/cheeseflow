/**
 * Cloudflare Pages Function to handle domain-based routing with hidden language prefixes
 * - cheeseflow.com/* → internally serves /en/* (prefix hidden from users)
 * - cheeseflow.com.cn/* → internally serves /zh/* (prefix hidden from users)
 * - cheeseflow.cn/* → internally serves /zh/* (prefix hidden from users)
 * - Wrong language on wrong domain → redirects to correct domain
 */
export async function onRequest(context: { request: Request; next: () => Promise<Response> }) {
  const { request, next } = context;
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

  // If path already has the correct language prefix, serve it (this handles internal routing)
  if (url.pathname.startsWith(`/${lang}/`) || url.pathname === `/${lang}`) {
    return next();
  }

  // Rewrite path to include language prefix internally
  // This keeps the URL clean for users but routes correctly internally
  let internalPath = url.pathname;
  if (internalPath === '/' || internalPath === '' || internalPath === '/index.html') {
    internalPath = `/${lang}/`;
  } else {
    // Add language prefix for internal routing
    internalPath = `/${lang}${internalPath.startsWith('/') ? '' : '/'}${internalPath}`;
  }

  // Fetch the content internally with the language-prefixed path
  const internalUrl = new URL(internalPath + url.search, url.origin);
  const internalRequest = new Request(internalUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'manual',
  });

  // Get the response from the internal route
  const response = await fetch(internalRequest);

  // Return the response without exposing the internal path
  return response;
}

