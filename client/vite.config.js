import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import responsiveImages from './tooling/responsive-images.js';

export default defineConfig({
  plugins: [react(), responsiveImages()],
  server: {
    // 5173 is Vite's default, so every project on this machine wants it —
    // the FlairMantra site uses it. Tanushree sits on 5174 so the two can run
    // at once. PORT still wins, which is how the launcher picks a free one.
    port: Number(process.env.PORT) || 5174,
    open: false,
    proxy: {
      '/api': { target: 'http://localhost:5050', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5050', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Keep the libraries in their own long-lived chunks so a content or
        // styling change does not force visitors to re-download React.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});
