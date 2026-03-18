import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ── Deployment-Variante wählen: ──
  // 'export'     → Statisch (GitHub Pages, kein Server nötig)
  // 'standalone' → Server-Build (Docker, Node.js Backend)
  output: 'export',

  // Bildoptimierung deaktivieren für statischen Export
  images: { unoptimized: true },
};

export default nextConfig;
