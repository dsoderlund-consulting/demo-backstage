import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    port: 8081,
    strictPort: true,
  },
  server: {
    allowedHosts: ['localhost', '${{ values.component }}.platform.local'],
    port: 8081,
    strictPort: true,
    host: true,
    origin: 'http://0.0.0.0:8081',
  },
});
