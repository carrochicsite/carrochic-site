import type { APIRoute } from 'astro';
import { SITE, waLink } from '../../lib/site';
import { supabase, tituloVeiculo } from '../../lib/supabase';
import { servidorClient, slugValido } from '../../lib/vendedor';

// Botão de WhatsApp: /wa/{slug-do-veiculo} (ou /wa/geral).
// O número é escolhido aqui, no servidor, e nunca vai para o HTML.
// ATENÇÃO: o cookie do vendedor foi DESATIVADO de propósito.
// Todos os botões abrem sempre o número do site principal (SITE.whatsapp).
export const GET: APIRoute = async ({ params, locals, request }) => {
  const sb = servidorClient(locals);
  const vslug = undefined as string | undefined; // antes: cookies.get(COOKIE_VENDEDOR)?.value
  const slug = params.slug ?? '';

  let vendedor: { id: string; nome: string; whatsapp: string } | null = null;
  if (sb && slugValido(vslug)) {
    const { data } = await sb
      .from('vendedores')
      .select('id,nome,whatsapp')
      .eq('slug', vslug)
      .eq('ativo', true)
      .eq('autorizou_divulgacao', true)
      .maybeSingle();
    vendedor = data;
  }

  let veiculo: any = null;
  if (slug && slug !== 'geral') {
    const { data } = await supabase
      .from('veiculos')
      .select('id,slug,marca,modelo,versao,ano_modelo')
      .eq('slug', slug)
      .maybeSingle();
    veiculo = data;
  }

  const numero = vendedor?.whatsapp?.replace(/\D/g, '') || SITE.whatsapp;
  const msg = veiculo
    ? `Olá! Vi o ${tituloVeiculo(veiculo)} no site da CARROCHIC e quero mais informações.`
    : 'Olá! Vim pelo site da CARROCHIC e quero ajuda para escolher um veículo.';

  if (sb) {
    try {
      let pagina: string | null = null;
      try { pagina = new URL(request.headers.get('referer') ?? '').pathname; } catch {}
      await sb.from('cliques').insert({
        vendedor_id: vendedor?.id ?? null,
        veiculo_id: veiculo?.id ?? null,
        tipo: 'whatsapp',
        pagina,
      });
    } catch {
      /* o clique nunca pode impedir o cliente de chegar ao WhatsApp */
    }
  }

  return new Response(null, {
    status: 302,
    headers: { Location: waLink(msg, numero), 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
};
