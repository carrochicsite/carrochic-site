import type { APIRoute } from 'astro';
import { COOKIE_ACCESS, COOKIE_REFRESH } from '../../lib/admin';

export const POST: APIRoute = ({ cookies, redirect }) => {
  cookies.delete(COOKIE_ACCESS, { path: '/admin' });
  cookies.delete(COOKIE_REFRESH, { path: '/admin' });
  return redirect('/admin/login', 303);
};
