import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` -> dist/ (served by server/ for multiplayer)
// `npm run build:single` -> dist-single/index.html (one double-clickable file)
export default defineConfig(({ mode }) => ({
  base: './',
  server: { port: mode === 'shared' ? 5199 : 5173, strictPort: mode === 'shared', host: mode === 'shared' ? '127.0.0.1' : true, hmr: mode !== 'shared' },
  preview: { port: 4173, host: true },
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    target: 'es2022',
    chunkSizeWarningLimit: 4000,
    assetsInlineLimit: mode === 'single' ? 100_000_000 : 4096,
  },
  plugins: mode === 'single' ? [viteSingleFile()] : [],
}));
