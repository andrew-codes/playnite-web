const defaultConfig = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(j|t)s$': ['<rootDir>/testUtils/db-client-transformer.cjs'],
  },
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    '^(\\.{1,2}/.*)\\.ts$': '$1',
    '^db-client$': '<rootDir>/../../libs/db-client/build/client.js',
  },
  extensionsToTreatAsEsm: ['.ts', '.mts'],
  testMatch: ['<rootDir>/__integration_tests__/**/*.(test).((j|t)s)'],
  resetMocks: true,
  // modulePathIgnorePatterns: ['<rootDir>/\\.dist/'],
  passWithNoTests: false,
  collectCoverage: false,
  // coveragePathIgnorePatterns: [
  //   '/node_modules/',
  //   '/__tests__/',
  //   '/testUtils/',
  //   'jest.config.js',
  //   '.config.js',
  //   '/scripts/',
  //   '/db-client/',
  //   '/.*db-client.*/',
  // ],
  // coverageDirectory: '<rootDir>/.test-runs/coverage/game-assets-processor-e2e',
  // coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['json', 'js', 'ts'],
}

export default defaultConfig
