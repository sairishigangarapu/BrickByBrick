/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'sfuhwvvgzuidmiherejt.supabase.co',
      },
    ],
  },
};

export default nextConfig;
