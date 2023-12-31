import { withEsbuildOverride } from 'remix-esbuild-override'
import styledComponentsPlugin from './styled-components-esbuild-plugin.mjs'

withEsbuildOverride((option) => {
  option.plugins.unshift(styledComponentsPlugin())

  return option
})

/** @type {import('@remix-run/dev').AppConfig} */

const config = {
  appDirectory: 'src',
  assetsBuildDirectory: 'public/build',
  future: {
    /* any enabled future flags */
  },
  ignoredRouteFiles: ['**/.*'],
  publicPath: '/build/',
  serverBuildPath: 'build/index.js',
}

export default config
