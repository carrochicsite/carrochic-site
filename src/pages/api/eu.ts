import type { APIRoute } from 'astro';
import { COOKIE_VENDEDOR, slugValido, vendedorPublico } from '../../lib/vendedor';

// Diz ao botão "Compartilhar" qual vendedor está ativo neste navegador (ou null).
// Não expõe o WhatsApp, só o código público do vendedor.
export const GET: APIRoute = async ({ cookies }) => {
  const v = cookies.get(COOKIE_VENDEDOR)?.value;
  const ok = slugValido(v) && (await vendedorPublico(v));
  return new Response(JSON.stringify({ v: ok ? v : null }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
};
