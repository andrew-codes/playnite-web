const defaultConfig = {
  preset: 'ts-jest/presets/default-esm',
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
  collectCoverage: false,
  moduleFileExtensions: ['json', 'js', 'ts'],
}

export default defaultConfig
