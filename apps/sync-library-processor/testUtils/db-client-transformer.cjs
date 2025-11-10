module.exports = {
  process(src, filename) {
    const isDbClientFile = /.*\/db-client\/.*$/.test(filename)
    console.debug(`Transforming file: ${filename}`, isDbClientFile)

    if (isDbClientFile) {
      // Remove problematic assignments for Jest ESM compatibility
      src = src.replace(/var __dirname ?=.+/g, '')
      src = src.replace(/var __filename ?=.+/g, '')
    }

    try {
      const { transformSync } = require('esbuild')
      const result = transformSync(src, {
        sourcefile: filename,
        loader: 'ts',
        format: 'cjs',
        target: 'node22',
        platform: 'node',
        sourcemap: 'inline',
      })

      return {
        code: result.code,
        map: result.map || null,
      }
    } catch (error) {
      console.error('esbuild transformation failed:', error)
      throw error
    }
  },
}
