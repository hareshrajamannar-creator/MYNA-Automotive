import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On GitHub Pages the app is served from /MYNA-Automotive/, so assets must
// be referenced from that base. Locally (dev/preview) it stays at root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Myna-Healthcare-agents/' : '/',
  plugins: [react()],
}))
