/**
 * Cloudflare Pages Function to handle domain-based routing
 * Rewrites URLs internally to hide /en and /zh from the URL
 * - cheeseflow.com/* → serves /en/* content (URL stays as /*)
 * - cheeseflow.com.cn/* → serves /zh/* content (URL stays as /*)
 * - cheeseflow.cn/* → serves /zh/* content (URL stays as /*)
 */
export async function onRequest({ request, next }: { request: Request; next: () => Promise<Response> }) {
  const url = new URL(request.url);
  const hostname = url.hostname;
  
  // Skip rewriting if already has language prefix (prevents infinite loops)
  if (url.pathname.startsWith('/en/') || url.pathname.startsWith('/zh/')) {
    return next();
  }
  
  // Determine language from domain
  // Priority: .com.cn > .cn (but not .com.cn) > exact match
  let isChinese = false;
  if (hostname.endsWith('.com.cn')) {
    isChinese = true;
  } else if (hostname.endsWith('.cn')) {
    isChinese = true;
  } else if (hostname === 'cheeseflow.cn') {
    isChinese = true;
  }
  
  const lang = isChinese ? 'zh' : 'en';
  
  // Rewrite paths to include language prefix internally
  let rewrittenPath = url.pathname;
  
  if (rewrittenPath === '/' || rewrittenPath === '' || rewrittenPath === '/index.html') {
    rewrittenPath = `/${lang}/`;
  } else {
    rewrittenPath = `/${lang}${rewrittenPath}`;
  }
  
  // Create rewritten URL (same origin)
  const rewrittenUrl = new URL(rewrittenPath + url.search, url.origin);
  
  // Fetch the content from the rewritten URL
  // This will go through the middleware again, but the check above will skip rewriting
  // and just serve the content directly
  try {
    const response = await fetch(rewrittenUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    // Clone the response
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    // If fetch fails, fall back to next()
    console.error('Middleware fetch error:', error);
    return next();
  }
}

