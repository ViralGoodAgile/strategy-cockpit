import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config — plain React + TS prototype, no backend.
export default defineConfig({
  plugins: [react()],
  // host: true binds all interfaces so 127.0.0.1 / localhost are reachable from a browser.
  server: { port: 5173, host: true },
});
