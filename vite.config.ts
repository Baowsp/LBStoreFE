import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

const BACKEND = 'http://103.161.171.232:8080';
const LOCAl = 'http://localhost:8080';

// https://vite.dev/config/
export default defineConfig({
  define: {
    global: 'window',
  },
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    proxy: {
      // Proxy ảnh upload từ backend (giống Vercel rewrites)
      '/uploads': {
        target: LOCAl,
        changeOrigin: true,
        secure: false,
      },
      // Proxy API calls (nếu dùng IP VPS khi dev)
      '/api': {
        target: LOCAl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

