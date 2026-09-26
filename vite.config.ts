import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'

const romDir = path.resolve('src/downloaded_roms')

function sendRom(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = req.url ?? ''
  if (req.method !== 'GET' || !url.startsWith('/roms/')) {
    next()
    return
  }

  const raw = decodeURIComponent(url.slice('/roms/'.length).split('?')[0] ?? '')
  const safeName = path.basename(raw)
  const filePath = path.join(romDir, safeName)
  const resolved = path.resolve(filePath)

  if (!resolved.startsWith(romDir) || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    res.statusCode = 404
    res.end('ROM not found')
    return
  }

  res.setHeader('Content-Type', 'application/octet-stream')
  fs.createReadStream(resolved).pipe(res)
}

function serveLocalRoms() {
  return {
    name: 'serve-local-roms',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(sendRom)
    },
    configurePreviewServer(server) {
      server.middlewares.use(sendRom)
    },
  }
}

export default defineConfig({
  plugins: [react(), serveLocalRoms()],
})
