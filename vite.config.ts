import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const enableSentrySourceMaps =
    mode === 'production' &&
    Boolean(process.env.SENTRY_AUTH_TOKEN) &&
    Boolean(process.env.SENTRY_ORG) &&
    Boolean(process.env.SENTRY_PROJECT)

  const plugins = [react()]

  if (enableSentrySourceMaps) {
    plugins.push(
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        telemetry: false,
      })
    )
  }

  return {
    plugins,
    base: process.env.VITE_BASE_PATH || '/holistic-assessment-tool',
    define: {
      __APP_ENV__: process.env.VITE_GEMINI_ENV,
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    resolve: {
      alias: {
        src: '/src',
      },
    },
    server: {
      fs: {
        allow: ['..'],
      },
    },
    build: {
      sourcemap: enableSentrySourceMaps,
      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // React core - rarely changes
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // UI libraries
            'vendor-ui': ['framer-motion', 'lucide-react', '@dnd-kit/core', '@dnd-kit/sortable'],
            // PDF generation - large, used only on report pages
            'vendor-pdf': ['@react-pdf/renderer'],
            // Supabase client
            'vendor-supabase': ['@supabase/supabase-js'],
          },
        },
      },
      // Use esbuild for minification (faster, built-in)
      minify: 'esbuild',
      // esbuild options for production
      target: 'es2020',
    },
  }
})
