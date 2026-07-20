/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  disable: true,
});

module.exports = withPWA({
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: { serverActions: { allowedOrigins: ["*"] } },
});
