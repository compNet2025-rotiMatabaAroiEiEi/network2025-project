import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
    host: true,           // 0.0.0.0 so Docker can expose it
    watch: {
      usePolling: true,   // force polling so file changes are detected
      interval: 100       // optional: check every 100ms
    }
  }
})
