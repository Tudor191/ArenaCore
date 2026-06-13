/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["hltv", "got-scraping", "header-generator", "node-cron"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img-cdn.hltv.org",
      },
      {
        protocol: "https",
        hostname: "www.hltv.org",
      },
    ],
  },
};

module.exports = nextConfig;
