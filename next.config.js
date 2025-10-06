/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 👇 Evita que ESLint bloquee el build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
