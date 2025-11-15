import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { viteSourceLocator } from '@metagptx/vite-plugin-source-locator';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    viteSourceLocator({
      prefix: 'mgx',
    }),
    react(),
  ],
  server: {
    watch: { usePolling: true, interval: 800 /* 300~1500 */ },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Keep only essential chunks - don't split dependencies that depend on React
          if (id.includes('node_modules/appwrite')) {
            return 'vendor-appwrite';
          }
          if (id.includes('node_modules/@stripe')) {
            return 'vendor-stripe';
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/chart.js')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
      },
    },
  },
  // Suppress specific warnings
  optimizeDeps: {
    include: ['react', 'react-dom', 'appwrite', '@stripe/stripe-js'],
  },
}));

