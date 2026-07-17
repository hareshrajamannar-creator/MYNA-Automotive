import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On GitHub Pages the app is served from /MYNA-Automotive/, so assets must
// be referenced from that base. On Vercel (and locally) it's served from root.
export default defineConfig(({ command }) => ({
  base: command === 'build' && !(globalThis as any).process?.env?.VERCEL ? '/MYNA-Automotive/' : '/',
  plugins: [react()],
}))
