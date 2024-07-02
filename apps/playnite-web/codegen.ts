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
        contextType: './context#PlayniteContext',
      },
    }),
  },
}
export default config
