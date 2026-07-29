import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/// <reference types="vitest" />
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    base: '/',
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt'],
        manifest: {
          name: 'AbiaWay Transit',
          short_name: 'AbiaWay',
          description: 'Smart transit system for Abia State. Real-time bus tracking, digital payments, and route planning.',
          theme_color: '#07101f',
          background_color: '#07101f',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https?:\/\/api\.abiaway\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              },
            },
          ],
        },
      }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: false,
    },
    server: {
      port: 5173,
      open: true,
    },
    define: {
      global: 'window',
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      sourcemap: false,
      minify: isProduction ? 'terser' : 'esbuild',
      terserOptions: isProduction ? {
        compress: {
          drop_console: false,
          drop_debugger: true,
        },
        format: { comments: false },
        mangle: true,
      } : {},
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react-helmet-async')) {
                return 'vendor-core';
              }
              if (id.includes('leaflet') || id.includes('@react-google-maps')) {
                return 'vendor-maps';
              }
              if (id.includes('qrcode.react')) {
                return 'vendor-qrcode';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide';
              }
              if (id.includes('@mui')) {
                return 'vendor-mui';
              }
              return 'vendor-other';
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
      chunkSizeWarningLimit: 600,
      assetsDir: 'assets',
      emptyOutDir: true,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'leaflet', 'qrcode.react', 'lucide-react', '@mui/material', '@mui/icons-material/esm'],
    },
  };
});