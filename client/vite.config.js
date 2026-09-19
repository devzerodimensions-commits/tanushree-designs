import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // PORT lets a launcher pick a free port when 5173 is already taken.
    port: Number(process.env.PORT) || 5173,
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
