import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  base: '',
  server: {
    mimeTypes: {
      '.wasm': 'application/wasm',
    },
  },
  plugins: [
    nodePolyfills(),
  ],
  optimizeDeps: {
    include: ['onnxruntime-web']
  }
});