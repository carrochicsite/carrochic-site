import { createClient } from '@supabase/supabase-js';

const URL_ = import.meta.env.PUBLIC_SUPABASE_URL;
const KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const COOKIE_ACCESS = 'cc_at';
export const COOKIE_REFRESH = 'cc_rt';
export const BUCKET = 'veiculos';

export const cookieOpts = (maxAge: number) => ({
  path: '/admin',
  httpOnly: true,
  secure: import.meta.env.PROD,
  sameSite: 'lax' as const,
  maxAge,
});

/** Cliente sem sessão (login e refresh). */
export const anonClient = () =>
  createClient(URL_, KEY, { auth: { persistSession: false, autoRefreshToken: false } });

/** Cliente que age como o usuário logado: as políticas RLS valem. */
export const userClient = (token: string) =>
  createClient(URL_, KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** "99.900,50" -> 99900.5 ; "99900" -> 99900 */
export function parseNumero(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  let s = String(v).trim().replace(/[^\d,.-]/g, '');
  if (!s) return null;
  s = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/\./g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export const texto = (v: FormDataEntryValue | null): string | null => {
  const s = v == null ? '' : String(v).trim();
  return s || null;
};

/** Caminho do arquivo dentro do bucket, a partir da URL pública. */
export const caminhoDoBucket = (url: string) => {
  const marca = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marca);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marca.length));
};
