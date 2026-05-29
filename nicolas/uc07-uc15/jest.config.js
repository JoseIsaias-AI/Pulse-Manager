const tsJestTransformer = require.resolve('ts-jest');

module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': tsJestTransformer
  },
  testRegex: 'tests/integration/.*\\.integration\\.test\\.ts$',
  passWithNoTests: true,
  clearMocks: true,
  verbose: true
};
