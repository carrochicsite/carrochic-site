import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
);

export const CAMPOS =
  'id,slug,tipo,marca,modelo,versao,ano_fabricacao,ano_modelo,km,cambio,combustivel,cor,preco,bairro,cidade,uf,descricao,status,destaque,vendido_em,updated_at,veiculo_fotos(url,alt,ordem,capa)';

export type Foto = { url: string; alt: string | null; ordem: number; capa: boolean };

export function fotosOrdenadas(v: any): Foto[] {
  return [...(v.veiculo_fotos ?? [])].sort(
    (a: Foto, b: Foto) => Number(b.capa) - Number(a.capa) || a.ordem - b.ordem,
  );
}

export const tituloVeiculo = (v: any) =>
  [v.marca, v.modelo, v.versao, v.ano_modelo].filter(Boolean).join(' ');
