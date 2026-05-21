import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['framer-motion', 'react', 'react-dom', 'lucide-react'],
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    open: true,
  },
  preview: {
    host: true,
    port: 4173,
    open: true,
  },
});
