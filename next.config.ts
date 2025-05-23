/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    env: {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
};

export default nextConfig;