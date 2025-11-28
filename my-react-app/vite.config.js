import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // อนุญาตให้เข้าถึงผ่าน domain นี้ได้
    host: true, 
    port: 5173,
    
    allowedHosts: ['front.gt7dev.com'],
    
    // แนะนำให้ใส่บรรทัดนี้ด้วย เพื่อให้ Nginx forward มาหาเจอ
  },
})