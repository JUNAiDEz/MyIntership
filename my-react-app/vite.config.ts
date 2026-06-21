import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // ใช้ "@/..." แทน "../../.." ได้
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // แยก vendor เป็น chunk แยก → deploy ใหม่ browser cache ส่วนนี้ไว้ได้ ไม่ต้องโหลดซ้ำ
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|react-helmet-async|scheduler)\//.test(id)) return 'react-vendor';
          if (id.includes('slick')) return 'slick-vendor';
          if (id.includes('react-icons') || id.includes('lucide-react')) return 'icons-vendor';
        },
      },
    },
  },
  server: {
    // อนุญาตให้เข้าถึงผ่าน domain นี้ได้
    host: true,
    port: 5173,

    allowedHosts: ['front.gt7motor.com', 'gt7motor.com', 'www.gt7motor.com', 'apigame.gt7dev.com', 'www.apigame.gt7dev.com'],

    // แนะนำให้ใส่บรรทัดนี้ด้วย เพื่อให้ Nginx forward มาหาเจอ
  },
})
