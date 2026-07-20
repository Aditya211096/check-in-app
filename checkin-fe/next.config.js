/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  disable: true, // Disable PWA during static GitHub Pages export
});

module.exports = withPWA({
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  experimental: { serverActions: { allowedOrigins: ["*"] } },
});
