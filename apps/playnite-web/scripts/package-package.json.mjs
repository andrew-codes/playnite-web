import fs from 'fs/promises'

const run = async () => {
  const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'))
  await fs.writeFile(
    '.packaged/package.json',
    JSON.stringify({
      name: 'playnite-web',
      type: 'module',
      dependencies: {
        '@remix-run/node': packageJson.dependencies['@remix-run/node'],
        '@remix-run/express': packageJson.dependencies['@remix-run/express'],
        debug: packageJson.dependencies['debug'],
        dotenv: packageJson.dependencies['dotenv'],
        express: packageJson.dependencies['express'],
      },
    }),
  )
}

run()
