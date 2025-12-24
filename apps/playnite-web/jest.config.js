import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read tsconfig paths for module resolution
const tsconfigBase = JSON.parse(
  readFileSync(join(__dirname, '../../tsconfig.base.json'), 'utf-8'),
)

const config = {
  displayName: 'web',
  preset: '../../jest.preset.cjs',
  transform: {
    '^.+\\.(j|t)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    // Map workspace packages from tsconfig paths
    ...Object.fromEntries(
      Object.entries(tsconfigBase.compilerOptions.paths).map(
        ([key, [value]]) => [`^${key}$`, `<rootDir>/../../${value}`],
      ),
    ),
  },
  extensionsToTreatAsEsm: ['.ts', '.mts'],
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
