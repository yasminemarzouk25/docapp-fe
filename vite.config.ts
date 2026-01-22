import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Load environment variables
const env = loadEnv('all', process.cwd());

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(env.VITE_PORT),
    watch: {
      usePolling: true
    }
  },
  build: {
    outDir: 'build',
    sourcemap: env.VITE_ENV === 'DEV'
  }
});
