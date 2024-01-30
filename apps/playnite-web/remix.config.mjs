import { withEsbuildOverride } from 'remix-esbuild-override'
import materialUiImportPlugin from './material-ui-import-esbuild-plugin.mjs'

withEsbuildOverride((option) => {
  option.plugins.unshift(materialUiImportPlugin())

  return option
})

/** @type {import('@remix-run/dev').AppConfig} */
/** @type {import('@remix-pwa/dev').WorkerConfig} */

const config = {
  appDirectory: 'src',
  assetsBuildDirectory: 'public/build',
  future: {
    /* any enabled future flags */
  },
  ignoredRouteFiles: ['**/.*'],
  publicPath: '/build/',
  serverBuildPath: 'build/index.js',

  // PWA
  entryWorkerFile: './src/entry.worker.ts',
  workerName: 'entry.worker',
  workerMinify: true,
}

export default config
