/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['example.com', 'steamcdn-a.akamaihd.net', 'media.steampowered.com'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    STEAM_RETURN_URL: process.env.STEAM_RETURN_URL,
  },
};

module.exports = nextConfig;
