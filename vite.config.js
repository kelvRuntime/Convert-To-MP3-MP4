import { defineConfig } from 'vite';

// Dev server proxies API requests to the backend Express server running on port 3000.
// Adjust the target if your backend runs on a different port.
export default defineConfig({
  server: {
    proxy: {
      '/info': 'http://localhost:5000',
      '/download': 'http://localhost:5000'
    }
  }
});
