import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Serve files from public directory during development
  publicDir: 'public',
  server: {},
});
