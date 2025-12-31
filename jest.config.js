const nextJest = require('next/jest');

const createJestConfig = nextJest({
    // next.config.js와 .env 파일이 있는 경로 제공
    dir: './',
});

// Jest에 전달할 커스텀 설정
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/lib/(.*)$': '<rootDir>/lib/$1',
        '^@/types/(.*)$': '<rootDir>/types/$1',
        '^@/app/(.*)$': '<rootDir>/app/$1',
    },
    testMatch: [
        '**/__tests__/**/*.{js,jsx,ts,tsx}',
        '**/*.{spec,test}.{js,jsx,ts,tsx}',
    ],
    collectCoverageFrom: [
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
    ],
};

// createJestConfig는 async이므로 Next.js 설정을 로드할 수 있습니다
module.exports = createJestConfig(customJestConfig);
