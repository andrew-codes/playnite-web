const { defaults } = require('jest-config')
const glob = require('glob')

const setupFiles = glob
  .sync('**/testsUtils/setupFile.ts')
  .map((path) => `<rootDir>/${path}`)

const defaultConfig = {
  transform: {
    '^.+\\.(j|t)s$': ['ts-jest', {}],
  },
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/apps/**/__tests__/**/*.(test).((j|t)s)',
    '<rootDir>/apps/*/__integration_tests__/**/*.(test).((j|t)s)',
    '<rootDir>/libs/**/__tests__/**/*.(test).((j|t)s)',
  ],
  resetMocks: true,
  modulePathIgnorePatterns: ['<rootDir>/.*/\\.dist/'],
  passWithNoTests: true,
  coverageDirectory: '<rootDir>/.test-runs/unit',
  collectCoverage: false,
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts'],
  collectCoverageFrom: ['<rootDir>/**/src/**/*.ts'],
  coveragePathIgnorePatterns: [
    '/__tests__/',
    '/__mocks__/',
    '/__component_tests__/',
    '/__integration_tests__/',
  ],
  setupFiles: setupFiles,
}

module.exports = defaultConfig

// import { defaults } from 'jest-config'

// const defaultConfig = {
//   testEnvironment: 'node',
//   transform: {
//     '^.+\\.(j|t)s$': ['ts-jest', { useEsm: true }],
//   },
//   moduleNameMapper: {
//     '^lodash-es$': 'lodash',
//     '^(\\.{1,2}/.*)\\.js$': '$1',
//   },
//   extensionsToTreatAsEsm: ['.ts'],
//   testMatch: ['<rootDir>/src/**/__tests__/**/*.(test).((j|t)s)'],
//   resetMocks: true,
//   modulePathIgnorePatterns: ['<rootDir>/\\.dist/'],
//   passWithNoTests: false,
//   coverageDirectory: '<rootDir>/.test-runs/unit',
//   collectCoverage: true,
//   moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts'],
//   collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
//   coveragePathIgnorePatterns: [
//     '/__tests__/',
//     '/__mocks__/',
//     '/__component_tests__/',
//     'src/server/server.ts',
//     'src/server/app.ts',
//   ],
// }

// export default defaultConfig
