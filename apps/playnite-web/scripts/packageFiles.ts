import { existsSync } from 'fs'
import fs from 'fs/promises'
import { globSync } from 'glob'
import path from 'path'

async function run() {
  if (!existsSync('build') || !existsSync('_build-output')) {
    console.error('Build files not found. Please build the project first.')
    process.exit(1)
  }

  console.log('Copying built files to _packaged')
  await fs.mkdir(path.join('_packaged', 'src', 'server'), { recursive: true })
  await fs.mkdir(path.join('_packaged', 'src', 'client'), { recursive: true })
  await fs.cp('_build-output', '_packaged', { recursive: true })
  await fs.cp('build/client', '_packaged/src/client', { recursive: true })
  console.debug(`Contents of _packaged:`)

  console.log('Modifying imports of generated files')
  await Promise.all(
    globSync('_packaged/.generated/*.js').map(async (file: string) => {
      let contents: string = await fs.readFile(file, 'utf8')

      const writeContents = contents
        .split('\n')
        .map((line) => {
          const matched =
            /import\s+(.*)\s+from\s+['"](\.\.?\/)(.+)['"];/gm.exec(line)
          return matched
            ? `import ${matched[1]} from '${matched[2]}${matched[3]}.js';`
            : line
        })
        .join('\n')
      await fs.writeFile(file, writeContents, 'utf8')
    }),
  )

  console.log('Copying and modifying package.json')
  const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'))
  pkg.name = `packaged-${pkg.name}`
  pkg.devDependencies = {}
  await fs.writeFile(
    '_packaged/package.json',
    JSON.stringify(pkg, null, 2),
    'utf8',
  )

  await fs.mkdir(path.join('_packaged', 'src', 'public', 'assets'), {
    recursive: true,
  })
  console.log('Copying assets')
  await fs.cp('src/public/assets', '_packaged/src/public/assets', {
    recursive: true,
  })
}

run().catch((error) => {
  console.error('FAILURE', error)
  process.exit(1)
})
