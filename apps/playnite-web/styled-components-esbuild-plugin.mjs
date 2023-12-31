import babel from '@babel/core'
import styled from 'babel-plugin-styled-components'
import fs from 'node:fs'
import path from 'path'

function styledComponentsPlugin() {
  return {
    name: 'styled-components',
    setup({ onLoad }) {
      const root = process.cwd()
      onLoad({ filter: /\.[tj]sx$/ }, async (args) => {
        let code = await fs.promises.readFile(args.path, 'utf8')
        let plugins = [
          'importMeta',
          'topLevelAwait',
          'classProperties',
          'classPrivateProperties',
          'classPrivateMethods',
          'jsx',
        ]
        let loader = 'jsx'
        if (args.path.endsWith('.tsx')) {
          plugins.push('typescript')
          loader = 'tsx'
        }
        const result = await babel.transformAsync(code, {
          babelrc: false,
          configFile: false,
          ast: false,
          root,
          filename: args.path,
          parserOpts: {
            sourceType: 'module',
            allowAwaitOutsideFunction: true,
            plugins,
          },
          generatorOpts: {
            decoratorsBeforeExport: true,
          },
          plugins: [styled],
          sourceMaps: true,
          inputSourceMap: false,
        })
        return {
          contents:
            result.code +
            `//# sourceMappingURL=data:application/json;base64,` +
            Buffer.from(JSON.stringify(result.map)).toString('base64'),
          loader,
          resolveDir: path.dirname(args.path),
        }
      })
    },
  }
}

export default styledComponentsPlugin
