import type { IGraphQLConfig } from 'graphql-config'
import path from 'path'

const config: IGraphQLConfig = {
  schema: [
    path.join(
      'apps',
      'playnite-web',
      'src',
      'server',
      'graphql',
      'modules',
      '**',
      '*.graphql',
    ),
  ],
  documents: [
    path.join('apps', 'playnite-web', 'src', 'queryHooks', '**', '*.{ts,tsx}'),
  ],
  include: [],
  exclude: ['**/__component__tests/**', '**/__tests__/**', '**/__mocks__/**'],
  extensions: {},
}

export default config
