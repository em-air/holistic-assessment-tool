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
    },
  }
})
