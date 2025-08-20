/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpilar pacotes para evitar warnings
  transpilePackages: ["@supabase/supabase-js", "@supabase/realtime-js"],
  
  // Configurações experimentais
  experimental: {
    // Permitir acesso via IP da LAN
    allowedDevOrigins: ["http://192.168.1.15:3000", "http://localhost:3000"],
  },
  
  // Configurações de imagem
  images: {
    domains: ['localhost', '192.168.1.15'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Configurações de headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Configurações de redirecionamento HTTPS
  async redirects() {
    return [
      {
        source: '/admin/:path*',
        destination: '/admin/:path*',
        permanent: false,
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'https',
          },
        ],
      },
    ]
  },
}

export default nextConfig
