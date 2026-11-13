import type { APIRoute } from 'astro';
import { COOKIE_VENDEDOR, cookieVendedor, slugValido, vendedorPublico } from '../../lib/vendedor';

// Link que o vendedor divulga: /v/fatima-rodrigues
export const GET: APIRoute = async ({ params, cookies }) => {
  const slug = params.slug;
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
  if (slugValido(slug) && (await vendedorPublico(slug))) {
    cookies.set(COOKIE_VENDEDOR, slug, cookieVendedor()); // vale o último link usado
  }
  return new Response(null, { status: 302, headers: { ...headers, Location: '/estoque' } });
};
