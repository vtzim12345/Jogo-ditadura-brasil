import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2019',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: false
  }
});
