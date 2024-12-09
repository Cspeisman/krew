/// <reference types="vite/client" />
import {defineConfig as viteConfig} from 'vite'
import {defineConfig as viteTestConfig, mergeConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'

export default mergeConfig(viteConfig({
    plugins: [react()]
  }), viteTestConfig({
    test: {
      environment: 'jsdom',
      exclude: ['**/e2e/**', '**/node_modules/**']
    }
  })
);
