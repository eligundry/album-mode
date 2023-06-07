/// <reference types="vitest" />
/// <reference types="vite/client" />
import react from '@vitejs/plugin-react'
import tsconfig from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfig()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./setup-vitest.js'],
  },
})
