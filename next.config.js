/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "hltv",
      "got-scraping",
      "header-generator",
      "node-cron",
      "puppeteer",
      "puppeteer-extra",
      "puppeteer-extra-plugin-stealth",
      "puppeteer-extra-plugin",
      "clone-deep",
      "merge-deep",
    ],
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
