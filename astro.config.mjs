import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  // Seedha apna root URL ya custom domain daalein:
  site: 'https://ubg2030.github.io', 
  // 'base' ki ab bilkul zaroorat nahi hai!
});
