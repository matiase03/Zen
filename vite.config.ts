import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'zip-download-handler',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && (req.url.startsWith('/api/download-overlay') || req.url.startsWith('/zenonia3-r36s-overlay.zip'))) {
              const filePath = path.resolve(__dirname, 'public/zenonia3-r36s-overlay.zip');
              if (fs.existsSync(filePath)) {
                const stat = fs.statSync(filePath);
                res.writeHead(200, {
                  'Content-Type': 'application/zip',
                  'Content-Disposition': 'attachment; filename="zenonia3-r36s-overlay.zip"',
                  'Content-Length': stat.size,
                  'Cache-Control': 'no-cache',
                });
                const stream = fs.createReadStream(filePath);
                stream.pipe(res);
                return;
              }
            }
            if (req.url && (req.url.startsWith('/api/download') || req.url.startsWith('/zenonia3_r36s_portmaster.zip'))) {
              const filePath = path.resolve(__dirname, 'public/zenonia3_r36s_portmaster.zip');
              if (fs.existsSync(filePath)) {
                const stat = fs.statSync(filePath);
                res.writeHead(200, {
                  'Content-Type': 'application/zip',
                  'Content-Disposition': 'attachment; filename="zenonia3_r36s_portmaster.zip"',
                  'Content-Length': stat.size,
                  'Cache-Control': 'no-cache',
                });
                const stream = fs.createReadStream(filePath);
                stream.pipe(res);
                return;
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
