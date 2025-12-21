const nxPreset = require('@nx/jest/preset').default

module.exports = {
  ...nxPreset,
  testEnvironment: 'node',
  moduleFileExtensions: ['json', 'js', 'ts'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
  resetMocks: true,
  passWithNoTests: true,
  collectCoverage: true,
  coverageDirectory: '<rootDir>/.test-runs/unit',
  coveragePathIgnorePatterns: [
    '/__tests__/',
    '/__mocks__/',
    '/__component_tests__/',
  ],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageReporters: ['text', 'text-summary', 'lcov', 'json', 'clover'],
}
