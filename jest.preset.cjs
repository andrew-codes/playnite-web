const nxPreset = require('@nx/jest/preset').default

module.exports = {
  ...nxPreset,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
}
