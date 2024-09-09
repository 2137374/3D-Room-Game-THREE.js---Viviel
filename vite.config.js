import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'three-ik': path.resolve(__dirname, 'node_modules/three-ik/build/three-ik.module.js'),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
});