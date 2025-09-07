import type { Config } from 'jest'

const config: Config = {
  displayName: 'web',
  preset: '../../jest.preset.cjs',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|json)$)': '@nx/react/plugins/jest',
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: [
    '/__tests__/',
    '/__mocks__/',
    '/__component_tests__/',
    'src/server/server.ts',
    'src/server/app.ts',
  ],
}

export default config
