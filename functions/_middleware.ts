/**
 * Cloudflare Pages Function to handle domain-based routing
 * Automatically redirects .com.cn and .cn domains to /zh
 */
export async function onRequest({ request, next }: { request: Request; next: () => Promise<Response> }) {
  const url = new URL(request.url);
  const hostname = url.hostname;
  
  // Handle root path redirects - intercept before static index.html is served
  // Also handle /index.html in case it's requested directly
  if (url.pathname === '/' || url.pathname === '' || url.pathname === '/index.html') {
    // Redirect .com.cn and cheeseflow.cn to Chinese
    if (hostname.includes('.com.cn') || hostname.includes('cheeseflow.cn')) {
      return Response.redirect(new URL('/zh', url), 302);
    }
    
    // Default to English for .com and other domains
    return Response.redirect(new URL('/en', url), 302);
  }
  
  // For all other paths, continue normally
  return next();
}

