import { defineConfig } from '@eddeee888/gcg-typescript-resolver-files'
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './src/server/graphql/modules/*/*.graphql',
  hooks: {
    afterAllFileWrite: ['yarn prettier --write'],
  },
  generates: {
    './src/server/graphql': defineConfig({
      typesPluginsConfig: {
        mappers: {
          CompletionStatus: './data/types#CompletionStatusEntity',
          Feature: './data/types#FeatureEntity',
          Game: './data/types#GameEntity',
          GameRelease: './data/types#GameReleaseEntity',
          Platform: './data/types#PlatformEntity',
        },
        contextType: './context#PlayniteContext',
      },
      //scalarsModule: require.resolve('graphql-scalars'),
    }),
  },
}
export default config
