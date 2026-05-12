import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/**
 * Bundle Analysis Configuration
 * 
 * Usage:
 * pnpm build -- --config vite-bundle-analysis.config.ts
 * 
 * This will generate a visualization of the bundle size in dist/stats.html
 */

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Manual chunks configuration for better code splitting
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'vendor-charts': ['recharts'],
          'vendor-animation': ['framer-motion'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
          
          // Feature chunks
          'feature-messages': ['react-window'],
          'feature-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'feature-trpc': ['@trpc/client', '@trpc/react-query', '@tanstack/react-query'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
