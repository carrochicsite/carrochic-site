import { defineMiddleware } from 'astro:middleware';
import { anonClient, userClient, COOKIE_ACCESS, COOKIE_REFRESH, cookieOpts } from './lib/admin';
import { COOKIE_VENDEDOR, cookieVendedor, slugValido } from './lib/vendedor';

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;

  // ---- Páginas públicas: cookie do vendedor ----
  if (pathname !== '/admin' && !pathname.startsWith('/admin/')) {
    // /qualquer-pagina?v=fatima-rodrigues -> grava o cookie e limpa o endereço
    const v = ctx.url.searchParams.get('v');
    if (slugValido(v) && !pathname.startsWith('/v/') && !pathname.startsWith('/wa/')) {
      ctx.cookies.set(COOKIE_VENDEDOR, v, cookieVendedor());
      const limpo = new URL(ctx.url);
      limpo.searchParams.delete('v');
      return ctx.redirect(limpo.pathname + limpo.search, 302);
    }
    // renova o cookie a cada visita (mais 400 dias)
    const atual = ctx.cookies.get(COOKIE_VENDEDOR)?.value;
    if (slugValido(atual)) ctx.cookies.set(COOKIE_VENDEDOR, atual, cookieVendedor());
    return next();
  }

  // ---- Painel (igual ao que já existia) ----
  const finish = async () => {
    const res = await next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  };

  if (pathname === '/admin/login') return finish();

  const entrar = () => ctx.redirect('/admin/login', 303);
  let access = ctx.cookies.get(COOKIE_ACCESS)?.value;
  const refresh = ctx.cookies.get(COOKIE_REFRESH)?.value;

  let user = null;
  if (access) {
    const { data } = await anonClient().auth.getUser(access);
    user = data.user;
  }
  if (!user && refresh) {
    const { data } = await anonClient().auth.refreshSession({ refresh_token: refresh });
    if (data.session) {
      access = data.session.access_token;
      user = data.session.user;
      ctx.cookies.set(COOKIE_ACCESS, access, cookieOpts(60 * 60));
      ctx.cookies.set(COOKIE_REFRESH, data.session.refresh_token, cookieOpts(60 * 60 * 24 * 30));
    }
  }
  if (!user || !access) return entrar();

  const sb = userClient(access);
  const { data: perfil } = await sb.from('perfis').select('is_admin').eq('id', user.id).maybeSingle();
  if (!perfil?.is_admin) {
    ctx.cookies.delete(COOKIE_ACCESS, { path: '/admin' });
    ctx.cookies.delete(COOKIE_REFRESH, { path: '/admin' });
    return new Response('Acesso restrito.', { status: 403 });
  }

  ctx.locals.sb = sb;
  ctx.locals.user = user;
  return finish();
});
