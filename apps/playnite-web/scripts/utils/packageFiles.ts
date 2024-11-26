import fs from 'fs'
import { globSync } from 'glob'
import sh from 'shelljs'

const run = () => {
  if (!fs.existsSync('build') || !fs.existsSync('.build-server')) {
    console.error('Build files not found. Please build the project first.')
    process.exit(1)
  }

  sh.mkdir('-p', '_packaged/src')
  sh.cp('-R', 'build/server', '_packaged/src')
  sh.cp('-R', 'build/client', '_packaged/src')
  sh.exec('cp -r .build-server/src/ _packaged/src/server')
  sh.cp('-R', '.build-server/.generated', '_packaged')

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

  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  pkg.name = `packaged-${pkg.name}`
  pkg.devDependencies = {}
  fs.writeFileSync(
    '_packaged/package.json',
    JSON.stringify(pkg, null, 2),
    'utf8',
  )

  sh.rm('-rf', '_packaged/src/client/assets/asset-by-id')
  sh.mkdir('-p', '_packaged/src/public/assets')
  sh.exec('cp -r public/assets/ _packaged/src/public/assets')
  sh.rm('-rf', '_packaged/src/public/assets/asset-by-id/*.*')
}

export default run
