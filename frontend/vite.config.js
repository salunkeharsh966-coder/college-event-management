import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration
// ------------------------------------------------------------------
// The dev server runs on port 5173 (the default).
// We also add a proxy so that any request from React to "/api/..."
// is forwarded to the Spring Boot server on port 8080.
// That means the axios base URL can simply be "/api" and there is
// no CORS problem during development.
// ------------------------------------------------------------------
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
