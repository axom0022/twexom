import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: true
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'vue',
      'svelte',
      'svelte/internal/client',
      '@angular/compiler',
      '@angular/core',
      '@angular/core/testing',
      '@angular/platform-browser/testing',
      'zone.js',
      'zone.js/testing'
    ]
  },
  build: {
    rollupOptions: {
      input: [
        new URL('./index.html', import.meta.url).pathname,
        new URL('./gesture.html', import.meta.url).pathname
      ]
    }
  }
})
