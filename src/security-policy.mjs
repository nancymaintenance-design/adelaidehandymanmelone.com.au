import { createHash } from 'node:crypto';

export const analyticsBootstrap = "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config', 'G-9KMWMVLZ3');";
// Establish progressive navigation before body paint; preserve links if its deferred script fails.
export const siteBootstrap = "document.documentElement.classList.add('nav-enhanced');document.addEventListener('error',function(event){if(event.target instanceof HTMLScriptElement&&event.target.src.endsWith('/assets/js/site.js'))document.documentElement.classList.remove('nav-enhanced')},true);" + analyticsBootstrap;
export const inlineStyles = ['--pin-x:39%;--pin-y:55%', '--pin-x:48%;--pin-y:67%', '--pin-x:64%;--pin-y:65%'];
export const cspHash = text => `'sha256-${createHash('sha256').update(text).digest('base64')}'`;
export const securityPolicy = [
  "default-src 'self'", "base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'", "form-action 'self'",
  `script-src 'self' https://www.googletagmanager.com ${cspHash(siteBootstrap)}`,
  "script-src-attr 'none'", "style-src 'self'",
  `style-src-attr 'unsafe-hashes' ${inlineStyles.map(cspHash).join(' ')}`,
  "img-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
  "font-src 'self'", "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com",
  "frame-src 'none'",
].join('; ');

export function validateSecurityPolicy(html, policy) {
  const directives = Object.fromEntries(policy.split(';').map(part => { const [name, ...values] = part.trim().split(/\s+/); return [name, values]; }));
  for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=|\btype=["']application\/ld\+json["']/i.test(attributes)) continue;
    if (!directives['script-src']?.includes(cspHash(body))) throw new Error('CSP executable script hash drift');
  }
  for (const [, value] of html.matchAll(/\bstyle="([^"]*)"/gi)) {
    if (!directives['style-src-attr']?.includes(cspHash(value))) throw new Error('CSP style attribute hash drift');
  }
}
