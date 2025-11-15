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
          // Vendor chunks
          if (id.includes('node_modules/appwrite')) {
            return 'vendor-appwrite';
          }
          if (id.includes('node_modules/@stripe')) {
            return 'vendor-stripe';
          }
          // Keep React and React-DOM together, don't split them
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-ui';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/chart.js')) {
            return 'vendor-charts';
          }
          
          // Feature-based chunks
          if (id.includes('/pages/Auth') || id.includes('contexts/AuthContext')) {
            return 'chunk-auth';
          }
          if (id.includes('/pages/Courses') || id.includes('/pages/CourseDetail')) {
            return 'chunk-courses';
          }
          if (id.includes('/pages/Dashboard') || id.includes('/pages/InstructorAnalytics')) {
            return 'chunk-dashboard';
          }
          if (id.includes('/pages/LessonView') || id.includes('VideoPlayer')) {
            return 'chunk-lessons';
          }
          if (id.includes('lib/stripe') || id.includes('PaymentSuccess')) {
            return 'chunk-payments';
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

