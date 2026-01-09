// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Como estamos testando Server Actions (Backend), o ambiente é Node
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/actions/**/*.ts'], // Foca a cobertura apenas nas Actions
    },
  },
})