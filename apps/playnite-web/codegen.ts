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
            '../src/server/graphql/resolverTypes#CompletionStatusEntity',
          Feature: '../src/server/graphql/resolverTypes#FeatureEntity',
          Game: '../src/server/graphql/resolverTypes#GameEntity',
          GameRelease: '../src/server/graphql/resolverTypes#GameReleaseEntity',
          Platform: '../src/server/graphql/resolverTypes#PlatformEntity',
          GameAsset: '../src/server/graphql/resolverTypes#GameAssetEntity',
          Playlist: '../src/server/graphql/resolverTypes#PlaylistEntity',
        },
        contextType: '../src/server/graphql/context#PlayniteContext',
      },
    }),
  },
}
export default config
