const defaultConfig = {
  globalSetup: '<rootDir>/__integration_tests__/globalSetup.ts',
  preset: '../../jest.preset.cjs',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(j|t)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    '^(\\.{1,2}/.*)\\.ts$': '$1',
    '^db-utils$': '<rootDir>/../../libs/db-utils/src/index.ts',
  },
  extensionsToTreatAsEsm: ['.ts', '.mts'],
  testMatch: ['<rootDir>/__integration_tests__/**/*.(test).((j|t)s)'],
  resetMocks: true,
  collectCoverage: false,
  moduleFileExtensions: ['json', 'js', 'ts'],
}

export default defaultConfig
