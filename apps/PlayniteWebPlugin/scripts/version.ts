import fs from 'fs/promises'
import path from 'path'
import sh from 'shelljs'
import { parse, stringify } from 'yaml'

async function run() {
  process.chdir(path.join(process.cwd(), 'src'))
  const extensionDefinitionContent = await fs.readFile('extension.yaml', 'utf8')
  const extensionDefinition = parse(extensionDefinitionContent)
  const { VERSION } = process.env

  if (!VERSION) {
    throw new Error('Missing environment variables')
  }
  extensionDefinition.Version = VERSION

  await fs.writeFile('extension.yaml', stringify(extensionDefinition), 'utf8')

  sh.exec(`msbuild PlayniteWeb.csproj -property:Configuration=Release`)
}

run()
