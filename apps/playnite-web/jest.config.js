const { defaults } = require('jest-config')

const defaultConfig = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(j|t)s$': ['ts-jest', {}],
  },
  testMatch: ['**/__tests__/**/*.(test).((j|t)s)'],
  resetMocks: true,
  modulePathIgnorePatterns: ['<rootDir>/\\.dist/'],
  passWithNoTests: false,
  coverageDirectory: '<rootDir>/.test-runs/unit',
  collectCoverage: true,
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: [
    '/__tests__/',
    '/__mocks__/',
    '/__component_tests__/',
  ],
}

module.exports = defaultConfig
