/** @type {import('next').NextConfig} */
const nextConfig = {
    // 이미지 최적화를 위한 설정
    images: {
        domains: ['localhost'],
        formats: ['image/avif', 'image/webp'],
    },

    // 환경 변수 설정
    env: {
        NEXT_PUBLIC_APP_NAME: 'GawjaPedia',
        NEXT_PUBLIC_APP_VERSION: '1.0.0',
    },

    // 빌드 최적화
    swcMinify: true,

    // 개발 환경 설정
    reactStrictMode: true,
};

module.exports = nextConfig;
