const nextConfig = {
    experimental: {
        // serverActions: true,
    },
    reactStrictMode : true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;