import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// GitHub Pages serves the site from /KAALACHAKRA360/; Vercel and the v0 preview serve from the root.
// GITHUB_ACTIONS is set automatically on GitHub runners; GITHUB_PAGES allows an explicit override.
const isGitHubPages =
  process.env.GITHUB_PAGES === 'true' ||
  (process.env.GITHUB_ACTIONS === 'true' && !process.env.VERCEL);

// https://vitejs.dev/config/
export default defineConfig({
  base: isGitHubPages ? '/KAALACHAKRA360/' : '/',
  plugins:[react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
