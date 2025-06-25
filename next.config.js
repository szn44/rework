/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@blocknote/core', '@blocknote/react', '@blocknote/mantine'],
  experimental: {
    esmExternals: true,
  },
}

module.exports = nextConfig 