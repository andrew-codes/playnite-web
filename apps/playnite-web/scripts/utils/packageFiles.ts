import fs from 'fs'
import { globSync } from 'glob'
import { rimraf } from 'rimraf'
import sh from 'shelljs'

const run = () => {
  if (!fs.existsSync('build') || !fs.existsSync('.build-server')) {
    console.error('Build files not found. Please build the project first.')
    process.exit(1)
  }

  console.log('Copying Remix built files to _packaged')
  sh.mkdir('-p', '_packaged/src')
  sh.exec('cp -R build/server _packaged/src')
  sh.exec('cp -R build/client _packaged/src')

  console.log('Copying Server built files to _packaged')
  sh.exec(`cp -R .build-server/src/* _packaged/src/server`)

  console.log('Copying Generated files')
  sh.exec('cp -R .build-server/.generated _packaged')

  console.log('Modifying imports of generated files')
  globSync('_packaged/.generated/*.js').forEach((file: string) => {
    let contents: string = fs.readFileSync(file, 'utf8')

    const writeContents = contents
      .split('\n')
      .map((line) => {
        const matched = /import\s+(.*)\s+from\s+['"](\.\.?\/)(.+)['"];/gm.exec(
          line,
        )
        return matched
          ? `import ${matched[1]} from '${matched[2]}${matched[3]}.js';`
          : line
      })
      .join('\n')
    fs.writeFileSync(file, writeContents, 'utf8')
  })

  console.log('Copying and modifying package.json')
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  pkg.name = `packaged-${pkg.name}`
  pkg.devDependencies = {}
  fs.writeFileSync(
    '_packaged/package.json',
    JSON.stringify(pkg, null, 2),
    'utf8',
  )

  sh.mkdir('-p', '_packaged/src/public/assets')
  console.log('Copying non-asset-by-id assets')
  sh.exec('cp -r src/public/assets/* _packaged/src/public/assets')

  console.log('Removing asset-by-id assets')
  rimraf.sync('_packaged/src/public/assets/asset-by-id/*.*')
}

export default run
