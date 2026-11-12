import type { APIRoute } from 'astro';
import { BUCKET, caminhoDoBucket } from '../../../lib/admin';
import { tituloVeiculo } from '../../../lib/supabase';

const TIPOS_OK: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' };
const MAX = 5 * 1024 * 1024;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const sb = locals.sb;
  const f = await request.formData();
  const acao = String(f.get('acao') ?? '');
  const veiculoId = String(f.get('veiculo_id') ?? '');
  const voltar = (erro?: string) =>
    redirect(`/admin/veiculo/${veiculoId}${erro ? `?erro=${encodeURIComponent(erro)}` : '?ok=foto'}`, 303);
  const json = (corpo: object, status = 200) =>
    new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } });

  if (!/^[0-9a-f-]{36}$/.test(veiculoId)) return json({ erro: 'Veículo inválido' }, 400);

  if (acao === 'upload') {
    const arq = f.get('arquivo');
    if (!(arq instanceof File)) return json({ erro: 'Arquivo ausente' }, 400);
    const ext = TIPOS_OK[arq.type];
    if (!ext) return json({ erro: 'Use JPG, PNG ou WebP' }, 400);
    if (arq.size > MAX) return json({ erro: 'Arquivo acima de 5 MB' }, 400);

    const { data: v } = await sb.from('veiculos').select('marca,modelo,versao,ano_modelo').eq('id', veiculoId).maybeSingle();
    if (!v) return json({ erro: 'Veículo não encontrado' }, 404);
    const { data: atuais } = await sb.from('veiculo_fotos').select('ordem').eq('veiculo_id', veiculoId);
    const ordem = (atuais ?? []).reduce((m: number, x: any) => Math.max(m, x.ordem), -1) + 1;

    const caminho = `${veiculoId}/${crypto.randomUUID()}.${ext}`;
    const { error: e1 } = await sb.storage.from(BUCKET).upload(caminho, await arq.arrayBuffer(), {
      contentType: arq.type,
      cacheControl: '31536000',
    });
    if (e1) return json({ erro: e1.message }, 500);
    const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(caminho);
    const { error: e2 } = await sb.from('veiculo_fotos').insert({
      veiculo_id: veiculoId,
      url: pub.publicUrl,
      alt: `${tituloVeiculo(v)} - foto ${ordem + 1}`,
      ordem,
      capa: (atuais ?? []).length === 0,
    });
    if (e2) {
      await sb.storage.from(BUCKET).remove([caminho]);
      return json({ erro: e2.message }, 500);
    }
    return json({ ok: true });
  }

  const url = String(f.get('url') ?? '');
  const { data: lista } = await sb.from('veiculo_fotos').select('id,url,ordem,capa').eq('veiculo_id', veiculoId).order('ordem').order('created_at');
  const fotos = lista ?? [];
  const i = fotos.findIndex((x: any) => x.url === url);
  if (i === -1) return voltar('Foto não encontrada.');

  if (acao === 'capa') {
    await sb.from('veiculo_fotos').update({ capa: false }).eq('veiculo_id', veiculoId);
    const { error } = await sb.from('veiculo_fotos').update({ capa: true }).eq('id', fotos[i].id);
    return voltar(error?.message);
  }

  if (acao === 'subir' || acao === 'descer') {
    const j = acao === 'subir' ? i - 1 : i + 1;
    if (j < 0 || j >= fotos.length) return voltar();
    [fotos[i], fotos[j]] = [fotos[j], fotos[i]];
    for (const [n, x] of fotos.entries()) {
      if (x.ordem !== n) await sb.from('veiculo_fotos').update({ ordem: n }).eq('id', x.id);
    }
    return voltar();
  }

  if (acao === 'excluir') {
    const caminho = caminhoDoBucket(fotos[i].url);
    if (caminho) await sb.storage.from(BUCKET).remove([caminho]);
    const { error } = await sb.from('veiculo_fotos').delete().eq('id', fotos[i].id);
    if (error) return voltar(error.message);
    if (fotos[i].capa) {
      const prox = fotos.find((_: any, k: number) => k !== i);
      if (prox) await sb.from('veiculo_fotos').update({ capa: true }).eq('id', prox.id);
    }
    return voltar();
  }

  return voltar('Ação inválida.');
};
