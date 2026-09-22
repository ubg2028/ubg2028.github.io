import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [tailwind(), sitemap()],
  site: 'https://ubg2028.github.io',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
});
