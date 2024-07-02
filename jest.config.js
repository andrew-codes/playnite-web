const { defaults } = require('jest-config')
const glob = require('glob')

const setupFiles = glob
  .sync('**/.tests/setupFiles.ts')
  .map((path) => `<rootDir>/${path}`)

const defaultConfig = {
  transform: {
    '^.+\\.(j|t)s$': ['ts-jest', {}],
  },
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.(test).((j|t)s)'],
  resetMocks: true,
  modulePathIgnorePatterns: ['<rootDir>/.*/\\.dist/'],
  passWithNoTests: true,
  coverageDirectory: '<rootDir>/.test-runs/unit',
  collectCoverage: true,
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts'],
  collectCoverageFrom: ['<rootDir>/**/src/**'],
  coveragePathIgnorePatterns: [
    '/__tests__/',
    '/__mocks__/',
    '/__component_tests__/',
  ],
  setupFiles: setupFiles,
}

module.exports = defaultConfig
