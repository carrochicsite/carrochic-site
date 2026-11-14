import type { APIRoute } from 'astro';
import { SITE, TIPOS } from '../lib/site';
import { supabase } from '../lib/supabase';

export const GET: APIRoute = async () => {
  const { data } = await supabase.from('veiculos').select('slug,updated_at').eq('status', 'ativo');
  const estaticas = ['/', ...Object.values(TIPOS).map((t) => `/${t.slug}`), '/privacidade', '/termos'];
  const urls = [
    ...estaticas.map((p) => `<url><loc>${SITE.url}${p === '/' ? '' : p}</loc></url>`),
    ...(data ?? []).map((v) => `<url><loc>${SITE.url}/veiculo/${v.slug}</loc><lastmod>${new Date(v.updated_at).toISOString()}</lastmod></url>`),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=300' } });
};
