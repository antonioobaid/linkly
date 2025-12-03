/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lpdonxoezdiwawsehsbs.supabase.co",
        pathname: "/storage/v1/object/public/avatars/**",
      },
      {
        protocol: "https",
        hostname: "lpdonxoezdiwawsehsbs.supabase.co",
        pathname: "/storage/v1/object/public/post-images/**",
      },
    ],
  },
};

module.exports = nextConfig;
