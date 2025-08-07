import { defineConfig } from '@eddeee888/gcg-typescript-resolver-files'
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './src/server/graphql/modules/*/*.graphql',
  hooks: {
    afterAllFileWrite: ['yarn prettier --write'],
  },
  generates: {
    './.generated': defineConfig({
      typesPluginsConfig: {
        mappers: {
          CompletionStatus:
            '../src/server/graphql/resolverTypes#GraphCompletionStatus',
          Feature: '../src/server/graphql/resolverTypes#GraphFeature',
          Game: '../src/server/graphql/resolverTypes#GraphGame',
          Release: '../src/server/graphql/resolverTypes#GraphRelease',
          Platform: '../src/server/graphql/resolverTypes#GraphPlatform',
          Playlist: '../src/server/graphql/resolverTypes#GraphPlaylist',
          Source: '../src/server/graphql/resolverTypes#GraphSource',
          User: '../src/server/graphql/resolverTypes#GraphUser',
          Library: '../src/server/graphql/resolverTypes#GraphLibrary',
          Tag: '../src/server/graphql/resolverTypes#GraphTag',
        },
        contextType: '../src/server/graphql/context#PlayniteContext',
      },
    }),
  },
}
export default config
