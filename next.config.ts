
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // The `allowedDevOrigins` is a security feature in Next.js that’s designed to prevent security
  // vulnerabilities like DNS rebinding attacks. It allows developers to explicitly whitelist
  // origins that are permitted to access the Next.js development server. This is important in a
  // cloud-based development environment like Firebase Studio, where the development server may
  // be accessed from various subdomains.
  allowedDevOrigins: [
    'https://*.googleusercontent.com',
    'https://*.cloudworkstations.dev',
  ],
};

export default nextConfig;
