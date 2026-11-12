import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://carrochic.com.br',
  output: 'server',
  adapter: cloudflare(),
  trailingSlash: 'never',
});
