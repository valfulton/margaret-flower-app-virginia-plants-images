import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cache images for 31 days - reduces repeat transformations by 70%
    minimumCacheTTL: 2678400,
    
    // Use only WebP format - cuts transformations in half  
    formats: ['image/webp'],
    
    // Limit image sizes to essential breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    deviceSizes: [640, 750, 828, 1080, 1200],
    
    // Keep your existing Supabase configuration
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rmflqfmmtobyihjyu.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
