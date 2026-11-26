import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const host = env.VITE_HOST || 'localhost'
  const port = Number(env.VITE_PORT) || 5173
  const strictPort = env.VITE_STRICT_PORT ? env.VITE_STRICT_PORT === 'true' : undefined
  const allowedHosts = env.VITE_ALLOWED_HOSTS
    ? env.VITE_ALLOWED_HOSTS.split(',').map((h) => h.trim()).filter(Boolean)
    : undefined

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host,
      port,
      ...(strictPort !== undefined && { strictPort }),
      ...(allowedHosts && { allowedHosts }),
    },
  }
})
