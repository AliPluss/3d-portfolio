import { defineConfig } from 'vite';

export default defineConfig({
  // Explicitly set root to project root (not /src)
  // This ensures index.html, main.js, and style.css all resolve correctly
  root: '.',
  publicDir: 'public', // /public files served at /
  server: {
    port: 5173,
    open: false,
  },
});
