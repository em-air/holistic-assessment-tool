import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/holistic-assessment-tool',
  define:{
    __APP_ENV__: process.env.VITE_GEMINI_ENV
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      src: "/src",
    },
  },
  server: {
    fs: {
      allow: ['..']
    },
    headers: {
      // Allow eval for @react-pdf/renderer which requires it
      'Content-Security-Policy': "script-src 'self' 'unsafe-inline' 'unsafe-eval'; worker-src 'self' blob:;"
    }
  }
});
