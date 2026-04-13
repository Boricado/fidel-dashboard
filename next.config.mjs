import path from 'node:path';

const nextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  turbopack: {
    root: path.join(process.cwd()),
  },
};

export default nextConfig;
