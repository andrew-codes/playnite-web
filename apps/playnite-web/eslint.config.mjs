import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import js from '@eslint/js'
import { fixupConfigRules } from '@eslint/compat'
import nx from '@nx/eslint-plugin'
import baseConfig from '../../eslint.config.mjs'
import cypress from 'eslint-plugin-cypress/flat'
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
})

const config = [
  ...fixupConfigRules(compat.extends('next')),
  ...fixupConfigRules(compat.extends('next/core-web-vitals')),
  cypress.configs['recommended'],
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      'cypress/no-unnecessary-waiting': 'off',
    },
    ignores: ['.next/**/*', '_packaged/**/*', '*-build', '.generated/**/*'],
  },
]

export default config
