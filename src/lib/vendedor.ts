import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

export const COOKIE_VENDEDOR = 'cc_v';
export const VENDEDOR_MAX_AGE = 60 * 60 * 24 * 400; // 400 dias: o máximo que os navegadores aceitam

export const slugValido = (s?: string | null): s is string => !!s && /^[a-z0-9-]{1,60}$/.test(s);

export const cookieVendedor = () => ({
  path: '/',
  httpOnly: true,
  secure: import.meta.env.PROD,
  sameSite: 'lax' as const,
  maxAge: VENDEDOR_MAX_AGE,
});

/** Dados PÚBLICOS do vendedor (sem o WhatsApp). Usa a chave anon. */
export async function vendedorPublico(slug: string) {
  const { data } = await supabase
    .from('vendedores')
    .select('id,nome,slug,foto_url')
    .eq('slug', slug)
    .eq('ativo', true)
    .eq('autorizou_divulgacao', true)
    .maybeSingle();
  return data;
}

/** Cliente de SERVIDOR (service_role). Só use em rotas que rodam no servidor, nunca em página que imprime dados. */
export function servidorClient(locals: any) {
  const env = locals?.runtime?.env ?? {};
  const key = env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = env.PUBLIC_SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;
  if (!key || !url) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
