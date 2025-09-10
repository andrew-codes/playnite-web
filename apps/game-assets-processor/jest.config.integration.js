const defaultConfig = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(j|t)s$': ['<rootDir>/testUtils/db-client-transformer.cjs'],
  },
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    '^(\\.{1,2}/.*)\\.ts$': '$1',
    '^db-client$': '<rootDir>/../../libs/db-client/src/client.ts',
  },
  extensionsToTreatAsEsm: ['.ts', '.mts'],
  testMatch: ['<rootDir>/__integration_tests__/**/*.(test).((j|t)s)'],
  resetMocks: true,
  modulePathIgnorePatterns: ['<rootDir>/\\.dist/'],
  passWithNoTests: false,
  coverageDirectory: '<rootDir>/.test-runs/integration',
  collectCoverage: true,
  moduleFileExtensions: ['json', 'js', 'ts'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: [
    '/__tests__/',
    '/__mocks__/',
    '/__integration_tests__/',
  ],
}

export default defaultConfig
