// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages mit eigener Domain (DNS bei Strato, Custom domain in den Repo-Einstellungen)
export default defineConfig({
  site: 'https://marvinangerer.de',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
