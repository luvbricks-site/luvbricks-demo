/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      // Include the SQLite db file in the deployment bundle
      '/**/*': ['./prisma/dev.db'],
    },
  },
};

module.exports = nextConfig;
