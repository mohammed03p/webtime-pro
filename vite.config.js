import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()], // Add this line
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'src/main.js'
    }
  }
});
