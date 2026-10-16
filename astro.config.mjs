// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages: https://oskar-hq.github.io/websiteangerer/
export default defineConfig({
  site: 'https://oskar-hq.github.io',
  base: '/websiteangerer',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
