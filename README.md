# CARROCHIC® — site (Astro + Cloudflare Workers + Supabase)

## Rodar no computador
1. Instale o Node.js 20+.
2. `npm install`
3. `npm run dev` e abra http://localhost:4321

## Publicar na Cloudflare (pelo GitHub)
Workers & Pages > Create application > Connect to Git > repositório `carrochic-site`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Variables (Settings > Variables): PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, PUBLIC_NOINDEX=true
  (as variáveis PUBLIC_ também precisam existir no build; use "Build variables" se aparecer essa opção)

## No lançamento
Troque PUBLIC_NOINDEX para false (ou apague) e faça um novo deploy.
