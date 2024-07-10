import fs from 'fs'
import { merge } from 'lodash'
import path from 'path'
import config from '../config.json'

run()

async function run() {
  const { VERSION } = process.env
  if (!VERSION) {
    return
  }
  const version = VERSION.replace(/^v/, '')
  const newConfig = merge({}, config, { version })

  fs.writeFileSync(
    path.join(__dirname, '..', 'config.json'),
    JSON.stringify(newConfig, null, 2),
  )
}
