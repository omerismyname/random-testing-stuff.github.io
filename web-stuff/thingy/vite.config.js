import { defineConfig } from 'vite';

export default defineConfig({
  base: '',
  server: {
    mimeTypes: {
      '.wasm': 'application/wasm',
    },
  }
});