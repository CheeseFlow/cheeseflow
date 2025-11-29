/**
 * Cloudflare Pages Function to handle domain-based routing
 * Redirects to language-specific paths based on domain
 * - cheeseflow.com/* → redirects to /en/* (if not already there)
 * - cheeseflow.com.cn/* → redirects to /zh/* (if not already there)
 * - cheeseflow.cn/* → redirects to /zh/* (if not already there)
 */
export async function onRequest(context: { request: Request; next: () => Promise<Response> }) {
  const { request, next } = context;
  const url = new URL(request.url);
  const hostname = url.hostname;
  
  // Determine language from domain
  // Priority: .com.cn > .cn (but not .com.cn) > exact match
  let isChinese = false;
  if (hostname.endsWith('.com.cn')) {
    isChinese = true;
  } else if (hostname.endsWith('.cn') && !hostname.endsWith('.com.cn')) {
    isChinese = true;
  } else if (hostname === 'cheeseflow.cn') {
    isChinese = true;
  }
  
  const lang = isChinese ? 'zh' : 'en';
  
  // If path already has the correct language prefix, serve normally
  if (url.pathname.startsWith(`/${lang}/`) || url.pathname === `/${lang}`) {
    return next();
  }
  
  // If path has wrong language prefix, redirect to correct one
  if (url.pathname.startsWith('/en/') || url.pathname === '/en') {
    const newPath = url.pathname.replace(/^\/en/, `/${lang}`);
    return Response.redirect(new URL(newPath + url.search, url.origin), 302);
  }
  if (url.pathname.startsWith('/zh/') || url.pathname === '/zh') {
    const newPath = url.pathname.replace(/^\/zh/, `/${lang}`);
    return Response.redirect(new URL(newPath + url.search, url.origin), 302);
  }
  
  // For paths without language prefix, add it and redirect
  let newPath = url.pathname;
  if (newPath === '/' || newPath === '' || newPath === '/index.html') {
    newPath = `/${lang}/`;
  } else {
    newPath = `/${lang}${newPath.startsWith('/') ? '' : '/'}${newPath}`;
  }
  
  const redirectUrl = new URL(newPath + url.search, url.origin);
  return Response.redirect(redirectUrl, 302);
}

