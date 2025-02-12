import * as defaultJestConfig from 'jest-config'

const defaultConfig = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(j|t)s$': ['ts-jest', { useEsm: true }],
  },
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.(test).((j|t)s)'],
  resetMocks: true,
  modulePathIgnorePatterns: ['<rootDir>/\\.dist/'],
  passWithNoTests: false,
  coverageDirectory: '<rootDir>/.test-runs/unit',
  collectCoverage: true,
  moduleFileExtensions: [
    ...defaultJestConfig.defaults.moduleFileExtensions,
    'ts',
  ],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: [
    '/__tests__/',
    '/__mocks__/',
    '/__component_tests__/',
    'src/server/server.ts',
    'src/server/app.ts',
  ],
}

export default defaultConfig
