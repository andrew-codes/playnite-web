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
          GameRelease: '../src/server/graphql/resolverTypes#GraphRelease',
          GameReleaseSubscriptionPayload:
            '../src/server/graphql/resolverTypes#GameReleaseStateSubscriptionPayload',
          Platform: '../src/server/graphql/resolverTypes#GraphPlatform',
          GameAsset: '../src/server/graphql/resolverTypes#GraphGameAsset',
          Playlist: '../src/server/graphql/resolverTypes#GraphPlaylist',
          Source: '../src/server/graphql/resolverTypes#GraphSource',
          User: '../src/server/graphql/resolverTypes#GraphUser',
        },
        contextType: '../src/server/graphql/context#PlayniteContext',
      },
    }),
  },
}
export default config
