/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  disable: true,
});

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repoName = "check-in-app";

module.exports = withPWA({
  reactStrictMode: true,
  output: "export",
  basePath: isGithubActions ? `/${repoName}` : "",
  assetPrefix: isGithubActions ? `/${repoName}/` : "",
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: { serverActions: { allowedOrigins: ["*"] } },
});
