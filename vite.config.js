import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  envPrefix: 'VITE_', // Ensure Vite loads .env variables with VITE_ prefix
});