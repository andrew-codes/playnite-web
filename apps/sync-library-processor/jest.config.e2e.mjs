import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read package.json and extract workspace dependencies
const packageJson = JSON.parse(
  readFileSync(join(__dirname, 'package.json'), 'utf-8'),
)

// Read tsconfig paths for module resolution
const tsconfigBase = JSON.parse(
  readFileSync(join(__dirname, '../../tsconfig.base.json'), 'utf-8'),
)

const workspacePackages = Object.entries({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
})
  .filter(([, version]) => version.startsWith('workspace:'))
  .map(([name]) => name)

const defaultConfig = {
  transformIgnorePatterns: [
    workspacePackages.length > 0
      ? `node_modules/(?!(${workspacePackages.join('|')})/)`
      : 'node_modules/',
  ],
  // Note: globalSetup is handled in scripts/e2e.ts to avoid ESM issues
  preset: '../../jest.preset.cjs',
  testEnvironment: 'node',
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
    // Mock isomorphic-dompurify to avoid jsdom ESM issues in node environment
    '^isomorphic-dompurify$': '<rootDir>/__mocks__/isomorphic-dompurify.ts',
    // Map workspace packages from tsconfig paths
    ...Object.fromEntries(
      Object.entries(tsconfigBase.compilerOptions.paths).map(([key, [value]]) => [
        `^${key}$`,
        `<rootDir>/../../${value}`,
      ]),
    ),
  },
  extensionsToTreatAsEsm: ['.ts', '.mts'],
  testMatch: ['<rootDir>/__integration_tests__/**/*.(test).((j|t)s)'],
  resetMocks: true,
  collectCoverage: false,
  moduleFileExtensions: ['json', 'js', 'ts'],
}

export default defaultConfig
