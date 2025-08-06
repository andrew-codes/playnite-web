import logger from 'dev-logger'
import sh from 'shelljs'
import devContainerSettings from '../devcontainer.json' with { type: 'json' }

run()

async function run() {
  await Promise.all(
    devContainerSettings.customizations.vscode.extensions.map((extension) => {
      logger.info(`Installing vscode extension: ${extension}`)
      return new Promise((resolve, reject) => {
        const process = sh.exec(`code --install-extension ${extension}`, {
          silent: true,
          async: true,
        })
        process.on('exit', (code) => {
          if (code !== 0) {
            logger.error(`Failed to install vscode extension: ${extension}`)
            reject(code)
          }
          resolve(code)
        })
      })
    }),
  )
  logger.info('Finished installing vscode extensions')
}
