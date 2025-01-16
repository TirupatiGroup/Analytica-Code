import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Access environment variables
const port = process.env.VITE_PORT || 3001;
const host = process.env.VITE_HOST || '0.0.0.0';
const apiUrl = process.env.API_URL || 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(port, 10),
    host: host,
    proxy: {
      '/api': {
        target: apiUrl, 
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
