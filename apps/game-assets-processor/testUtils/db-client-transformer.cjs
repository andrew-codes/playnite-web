module.exports = {
  process(src, filename) {
    console.debug(`Transforming file: ${filename}`)
    const isClientFile = /.*\/\.generated\/.*client\.(ts|js)$/.test(filename)

    if (isClientFile) {
      // Remove problematic __dirname assignments for Jest ESM compatibility
      src = src.replace(
        /const __dirname ?=.+/g,
        '// __dirname assignment removed for Jest ESM compatibility',
      )
    }

    try {
      const { transformSync } = require('esbuild')
      const result = transformSync(src, {
        sourcefile: filename,
        loader: 'ts',
        format: 'cjs',
        target: 'node22',
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
