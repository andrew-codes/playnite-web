const { defaults } = require('jest-config')

const defaultConfig = {
  transform: {
    '^.+\\.(j|t)sx?$': ['ts-jest', {}],
  },
  resetMocks: true,
  modulePathIgnorePatterns: ['<rootDir>/\\.dist/'],
  passWithNoTests: false,
  coverageDirectory: '<rootDir>/.test-runs/unit',
  collectCoverage: true,
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  collectCoverageFrom: ['**/src/**', '**/scripts/**'],
  coveragePathIgnorePatterns: ['/__tests__/', '/__mocks__/'],
  setupFiles: ['<rootDir>/.tests/setupFiles.ts'],
}

module.exports = defaultConfig
