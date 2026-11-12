import type { APIRoute } from 'astro';
import { SITE, NOINDEX } from '../lib/site';

export const GET: APIRoute = () => {
  const body = NOINDEX
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${SITE.url}/sitemap.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
