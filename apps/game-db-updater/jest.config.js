const { defaults } = require('jest-config')

const defaultConfig = {
  transform: {
    '^.+\\.(j|t)s$': ['ts-jest', {}],
  },
  testMatch: ['**/__tests__/**/*.(test).((j|t)s)'],
  resetMocks: true,
  modulePathIgnorePatterns: ['<rootDir>/\\.dist/'],
  passWithNoTests: false,
  coverageDirectory: '<rootDir>/.test-runs/unit',
  collectCoverage: true,
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'ts'],
  collectCoverageFrom: ['<rootDir>/src/**'],
  coveragePathIgnorePatterns: ['/__tests__/', '/__mocks__/'],
  setupFiles: ['<rootDir>/.tests/setupFiles.ts'],
}

module.exports = defaultConfig
