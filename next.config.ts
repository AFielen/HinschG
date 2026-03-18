import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ── Deployment-Variante wählen: ──
  // 'export'     → Statisch (GitHub Pages, kein Server nötig)
  // 'standalone' → Server-Build (Docker, Node.js Backend)
  output: 'standalone',
};

export default nextConfig;
