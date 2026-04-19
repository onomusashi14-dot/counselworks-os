/** @type {import('next').NextConfig} */
const UPSTREAM_API =
  process.env.API_PROXY_TARGET ||
  "https://counselworks-api-production.up.railway.app";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${UPSTREAM_API}/:path*`,
      },
    ];
  },
};

export default nextConfig;
