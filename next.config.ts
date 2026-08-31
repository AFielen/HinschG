import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ── Deployment-Variante wählen: ──
  // 'export'     → Statisch (GitHub Pages, kein Server nötig)
  // 'standalone' → Server-Build (Docker, Node.js Backend)
  output: 'standalone',

  // Kein X-Powered-By-Header (kein unnötiges Server-Fingerprinting)
  poweredByHeader: false,
};

export default nextConfig;
