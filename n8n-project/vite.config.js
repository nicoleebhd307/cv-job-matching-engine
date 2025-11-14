import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5178,
    open: true,
    proxy: {
      '/api': {
        target: 'https://nhivtp234111e.app.n8n.cloud',
        changeOrigin: true,
        secure: false,
        // /api/cv-upload -> /webhook/cv-upload
        rewrite: (path) => path.replace(/^\/api/, '/webhook'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Proxying:', req.method, req.url, '→', proxyReq.path);
          });
        },
      },
    },
  },
})