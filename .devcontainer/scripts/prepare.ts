import createDebugger from 'debug'
import sh from 'shelljs'
import devContainerSettings from '../devcontainer.json' with { type: 'json' }

const debug = createDebugger('playnite-web/devcontainer')

run()

async function run() {
  await Promise.all(
    devContainerSettings.customizations.vscode.extensions.map((extension) => {
      debug(`Installing vscode extension: ${extension}`)
      return new Promise((resolve, reject) => {
        const process = sh.exec(`code --install-extension ${extension}`, {
          silent: true,
          async: true,
        })
        process.on('exit', (code) => {
          if (code !== 0) {
            debug(`Failed to install vscode extension: ${extension}`)
            reject(code)
          }
          resolve(code)
        })
      })
    }),
  )
  debug('Finished installing vscode extensions')
}
