import path from 'path'
import sh from 'shelljs'

async function run() {
  process.chdir(path.join(process.cwd(), 'src'))

  sh.exec(`msbuild PlayniteWebMqtt.csproj -property:Configuration=Release`)
}

run()
