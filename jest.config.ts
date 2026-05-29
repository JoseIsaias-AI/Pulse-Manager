import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/backend/tests/**/*.spec.ts', '**/backend/tests/**/*.test.ts'],
  setupFiles: ['./backend/tests/setup.js'],
  clearMocks: true,
};

export default config;
