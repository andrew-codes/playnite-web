const defaultConfig = {
  globalSetup: '<rootDir>/__integration_tests__/globalSetup.ts',
  preset: '../../jest.preset.cjs',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(j|t)s$': ['<rootDir>/testUtils/db-client-transformer.cjs'],
  },
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    '^(\\.{1,2}/.*)\\.ts$': '$1',
    '^db-utils$': '<rootDir>/../../libs/db-utils/src/index.ts',
  },
  extensionsToTreatAsEsm: ['.ts', '.mts'],
  testMatch: ['<rootDir>/__integration_tests__/**/*.(test).((j|t)s)'],
  resetMocks: true,
  coverageDirectory: '<rootDir>/.test-runs/e2e',
  coveragePathIgnorePatterns: [
    '/__tests__/',
    '/__mocks__/',
    'src/testSetup.ts',
    '/testUtils/',
    '__integration_tests__/globalSetup.ts',
    'jest.config.e2e.mjs',
  ],
  moduleFileExtensions: ['json', 'js', 'ts'],
}

export default defaultConfig
