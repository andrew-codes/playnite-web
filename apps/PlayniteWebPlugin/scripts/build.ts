import fs from 'fs/promises'
import path from 'path'
import sh from 'shelljs'
import pkg from '../package.json'

async function run() {
  process.chdir(path.join(process.cwd(), 'src'))

  await fs.writeFile('extension.yaml',
    `
Id: PlayniteWeb_ec3439e3-51ee-43cb-9a8a-5d82cf45edac
Name: Playnite Web
Author: Andrew Smith
Module: PlayniteWeb.dll
Type: GenericPlugin
Icon: Resources\\icon.png
Version: ${pkg.version}
`,
    'utf8',
  )

  sh.exec(`msbuild PlayniteWeb.csproj -property:Configuration=Release`)
}

run()
