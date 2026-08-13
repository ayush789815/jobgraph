import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // In development the Vite dev server proxies API calls to Express, so the
    // browser never needs CORS. In production the client is served separately
    // (e.g. Vercel) and VITE_API_URL points at the deployed API.
    proxy: {
      '/api': {
        // Overridable so a second API instance (e.g. a Freebuff worktree
        // preview on another port) can back the dev server.
        target: process.env.API_PROXY_TARGET || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
