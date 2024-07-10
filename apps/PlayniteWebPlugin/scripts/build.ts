import path from 'path'
import sh from 'shelljs'

async function run() {
  process.chdir(path.join(process.cwd(), 'src'))

  sh.exec(`msbuild PlayniteWeb.csproj -property:Configuration=Release`)
}

run()
