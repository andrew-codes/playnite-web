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
