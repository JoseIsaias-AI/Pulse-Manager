import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.spec.ts', '**/src/tests/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/src/tests/e2e/'],
  setupFiles: ['./src/tests/setup.js'],
  clearMocks: true,
};

export default config;
