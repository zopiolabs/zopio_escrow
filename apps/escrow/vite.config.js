/**
 * SPDX-License-Identifier: MIT
 */

import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        additionalData: `
         @use "@/src/styles/toRem" as *;
          @use "@/src/styles/breakpoint" as *;`,
      },
    },
  },
  server: {
    port: 5178,
    open: true,
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: 'dist',
    minify: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js',
      },
    },
  },
  esbuild: {
    minify: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    browserField: true,
  },
});
